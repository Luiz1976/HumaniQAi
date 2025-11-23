import { QueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { authService } from '@/services/authService';

// Base de API e fallback (alinha com ApiService/AuthServiceNew)
const PRODUCTION_API_URL = 'https://humaniq-ai-production.up.railway.app/api';
const RAW_API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : '');
const API_BASE = (RAW_API_BASE || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');
const RAW_FALLBACK_BASE = import.meta.env.VITE_API_FALLBACK_URL || '';
const API_FALLBACK_BASE = (RAW_FALLBACK_BASE || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dados sempre considerados desatualizados
      refetchOnWindowFocus: true, // Recarregar ao focar na janela
      refetchOnMount: true, // Recarregar ao montar o componente
      retry: 1,
      queryFn: async ({ queryKey }) => {
        // Usar a primeira chave como endpoint
        const endpoint = queryKey[0] as string;
        return await apiRequest(endpoint);
      },
    },
  },
});

// Função helper para fazer requisições autenticadas
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isAbsolute = /^https?:\/\//i.test(endpoint);
  const buildUrl = (base: string) => (isAbsolute ? endpoint : `${base}${endpoint}`);

  const cookieToken = Cookies.get('authToken') || Cookies.get('token');
  const lsAuthToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const lsTokenAlt = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const token = (cookieToken && cookieToken.length > 0)
    ? cookieToken
    : (lsAuthToken && lsAuthToken.length > 0)
      ? lsAuthToken
      : (lsTokenAlt && lsTokenAlt.length > 0)
        ? lsTokenAlt
        : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const method = (options.method || 'GET').toUpperCase();
  const hasToken = !!token;
  try {
    if (typeof window !== 'undefined') {
      console.log('[API]', new Date().toISOString(), method, endpoint, { hasToken, origin: window.location.origin, base: API_BASE, fallback: API_FALLBACK_BASE });
    } else {
      console.log('[API]', new Date().toISOString(), method, endpoint, { hasToken, origin: 'ssr', base: API_BASE, fallback: API_FALLBACK_BASE });
    }
  } catch (_) {}

  const tryFetch = async (url: string) => {
    const response = await fetch(url, { ...options, headers });
    let data: any = null;
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }
    if (!response.ok) {
      const message = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      // Em 401/403, aciona fluxo de logout
      if (response.status === 401 || response.status === 403) {
        try { await authService.logout(); } catch (_) {}
        try { Cookies.remove('authToken'); Cookies.remove('currentUser'); } catch (_) {}
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        } catch (_) {}
      }
      const err: any = new Error(message);
      err.status = response.status;
      err.url = url;
      err.data = data;
      throw err;
    }
    return data as T;
  };

  const primaryUrl = API_BASE ? buildUrl(API_BASE) : endpoint;
  try {
    return await tryFetch(primaryUrl);
  } catch (error: any) {
    const isServerError = typeof error?.status === 'number' && error.status >= 500;
    const isNetworkError = !error?.status;
    const canFallback = Boolean(API_FALLBACK_BASE);

    if ((isServerError || isNetworkError || error?.status === 404) && canFallback) {
      const fallbackUrl = buildUrl(API_FALLBACK_BASE);
      try {
        return await tryFetch(fallbackUrl);
      } catch (_) {}
    }

    // Por fim, tenta relativo (útil em dev com proxy)
    if (!isAbsolute) {
      try {
        return await tryFetch(endpoint);
      } catch (_) {}
    }

    throw error;
  }
}
