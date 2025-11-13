import { QueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

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
      console.log('[API]', new Date().toISOString(), method, endpoint, { hasToken, origin: window.location.origin });
    } else {
      console.log('[API]', new Date().toISOString(), method, endpoint, { hasToken, origin: 'ssr' });
    }
  } catch (_) {}

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    try {
      console.error('[API]', method, endpoint, 'falhou', { status: response.status, statusText: response.statusText, error: data?.error || data?.message });
    } catch (_) {}
    const message = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return data as T;
}
