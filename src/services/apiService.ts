// Serviço para comunicação com a API backend
// Em desenvolvimento: usa URL relativa (proxy Vite)
// Em produção: usa VITE_API_URL do ambiente
import Cookies from 'js-cookie';
const getApiBase = () => {
  const envRaw = import.meta.env.VITE_API_URL || '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const raw = envRaw || origin;
  const trimmed = raw.replace(/\/+$/, '').replace(/\/api$/, '');
  try {
    const host = new URL(trimmed).hostname;
    if (host === 'www.humaniqai.com.br') {
      return 'https://api.humaniqai.com.br';
    }
  } catch (_) {}
  return trimmed;
};
const API_BASE_URL = getApiBase();
const RAW_FALLBACK_BASE = import.meta.env.VITE_API_FALLBACK_URL || '';
const API_FALLBACK_BASE = RAW_FALLBACK_BASE.replace(/\/+$/, '').replace(/\/api$/, '');

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ConviteEmpresa {
  nomeEmpresa: string;
  emailContato: string;
  telefone?: string;
  numeroColaboradores?: number;
  diasValidade?: number;
}

interface ConviteColaborador {
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  diasValidade?: number;
}

interface ConviteResponse {
  id: string;
  token: string;
  nomeEmpresa?: string;
  emailContato?: string;
  email?: string;
  nome?: string;
  cargo?: string;
  departamento?: string;
  validade: string;
  status: string;
  linkConvite?: string;
  // Datas opcionais retornadas pelo backend
  createdAt?: string;
  created_at?: string;
  // Configuração de acesso (apenas convites de empresa)
  diasAcesso?: number;
}

function getAuthToken(): string | null {
  const cookieTokenPrimary = Cookies.get('authToken');
  if (cookieTokenPrimary && typeof cookieTokenPrimary === 'string' && cookieTokenPrimary.length > 0) {
    return cookieTokenPrimary;
  }
  const cookieTokenFallback = Cookies.get('token');
  if (cookieTokenFallback && typeof cookieTokenFallback === 'string' && cookieTokenFallback.length > 0) {
    return cookieTokenFallback;
  }
  const lsTokenPrimary = localStorage.getItem('authToken');
  if (lsTokenPrimary && lsTokenPrimary.length > 0) {
    return lsTokenPrimary;
  }
  const lsTokenFallback = localStorage.getItem('token');
  return lsTokenFallback || null;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const buildUrl = (base: string) => `${base}${endpoint}`;

    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const primaryUrl = API_BASE_URL ? buildUrl(API_BASE_URL) : endpoint;

    const tryFetch = async (url: string) => {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        const err = new Error(`Resposta não JSON do backend: ${text.slice(0, 120)}`) as any;
        err.status = response.status;
        err.url = url;
        err.text = text;
        throw err;
      }

      const data = await response.json();

      if (!response.ok) {
        const err = new Error(data?.error || `HTTP ${response.status}: ${response.statusText}`) as any;
        err.status = response.status;
        err.url = url;
        err.data = data;
        throw err;
      }

      return data as T;
    };

    try {
      return await tryFetch(primaryUrl);
    } catch (error: any) {
      const isServerError = typeof error?.status === 'number' && error.status >= 500;
      const isNetworkError = !error?.status; // falha de rede geralmente não tem status
      const canFallback = Boolean(API_FALLBACK_BASE);

      if ((isServerError || isNetworkError) && canFallback) {
        const fallbackUrl = buildUrl(API_FALLBACK_BASE);
        console.warn(`⚠️ [ApiService] Erro em '${primaryUrl}' → tentando fallback '${fallbackUrl}'`);
        try {
          return await tryFetch(fallbackUrl);
        } catch (_) {}
      }

      if (isNetworkError || (error?.status && error.status >= 500)) {
        const relativeUrl = endpoint;
        try {
          return await tryFetch(relativeUrl);
        } catch (_) {}
      }

      throw error;
    }
  }

  // Health check da API
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }

  // Criar convite de empresa
  async criarConviteEmpresa(dados: ConviteEmpresa): Promise<ConviteResponse> {
    const response = await this.makeRequest<any>(
      '/api/convites/empresa',
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );
    // Compatível com formatos antigo e novo
    const convite = response?.data ?? response?.convite ?? response;
    return convite as ConviteResponse;
  }

  // Criar convite de colaborador
  async criarConviteColaborador(dados: ConviteColaborador): Promise<ConviteResponse> {
    const response = await this.makeRequest<any>(
      '/api/convites/colaborador',
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );
    // Compatível com formatos antigo e novo
    const convite = response?.data ?? response?.convite ?? response;
    return convite as ConviteResponse;
  }

  // Buscar convite por token
  async buscarConvitePorToken(token: string, tipo: 'empresa' | 'colaborador'): Promise<ConviteResponse> {
    const response = await this.makeRequest<{ convite: ConviteResponse; tipo: string }>(
      `/api/convites/token/${token}?tipo=${tipo}`
    );
    return response.convite;
  }

  // Aceitar convite de empresa
  async aceitarConviteEmpresa(
    token: string,
    senha: string,
    logoBase64?: string
  ): Promise<{ message: string; empresa: any }> {
    try {
      return await this.makeRequest(`/api/convites/empresa/aceitar/${token}`, {
        method: 'POST',
        body: JSON.stringify({ senha, logoBase64 }),
      });
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error('Convite inexistente. Verifique o link enviado.');
      }
      if (error?.status === 409) {
        throw new Error('Convite já utilizado. Caso precise, solicite um novo convite.');
      }
      if (error?.status === 410) {
        throw new Error('Convite expirado. Solicite um novo convite ao administrador.');
      }
      throw error;
    }
  }

  // Aceitar convite de colaborador
  async aceitarConviteColaborador(token: string, senha: string): Promise<{ message: string; colaborador: any }> {
    try {
      return await this.makeRequest(`/api/convites/colaborador/aceitar/${token}`, {
        method: 'POST',
        body: JSON.stringify({ senha }),
      });
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error('Convite inexistente. Verifique o link enviado.');
      }
      if (error?.status === 409) {
        throw new Error('Convite já utilizado. Solicite um novo convite.');
      }
      if (error?.status === 410) {
        throw new Error('Convite expirado. Solicite um novo convite à empresa.');
      }
      throw error;
    }
  }

  // Listar convites
  async listarConvites(): Promise<{ convites: ConviteResponse[]; tipo: string }> {
    return this.makeRequest('/api/convites/listar');
  }

  // Cancelar convite de colaborador
  async cancelarConviteColaborador(token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/api/convites/colaborador/${token}`, {
      method: 'DELETE',
    });
  }

  // Cancelar convite de empresa
  async cancelarConviteEmpresa(token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/api/convites/empresa/${token}`, {
      method: 'DELETE',
    });
  }

  // Listar testes disponíveis
  async listarTestes(): Promise<{ testes: any[] }> {
    return this.makeRequest('/api/testes');
  }

  // Obter perguntas de um teste
  async obterPerguntasTeste(testeId: string): Promise<{ perguntas: any[]; total: number }> {
    return this.makeRequest(`/api/testes/${testeId}/perguntas`);
  }

  // Submeter resultado de teste
  async submeterResultadoTeste(dados: {
    testeId: string;
    respostas: Array<{ perguntaId: string; valor: string; pontuacao?: number }>;
    tempoGasto?: number;
    sessionId?: string;
  }): Promise<{ message: string; resultado: any }> {
    return this.makeRequest('/api/testes/resultado', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Obter meus resultados
  async obterMeusResultados(): Promise<{ resultados: any[]; total: number }> {
    return this.makeRequest('/api/testes/resultados/meus');
  }

  // Obter resultado por ID
  async obterResultadoPorId(id: string): Promise<{ resultado: any; respostas: any[] }> {
    try {
      return await this.makeRequest(`/api/testes/resultado/${id}`);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        try {
          const cacheRaw = localStorage.getItem('resultadosCache');
          const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
          const item = cache[id];
          if (item) {
            return { resultado: item, respostas: [] };
          }
        } catch (_) {}
      }
      throw err;
    }
  }

  // Obter dados da empresa
  async obterDadosEmpresa(): Promise<{ empresa: any }> {
    return this.makeRequest('/api/empresas/me');
  }

  // Atualizar configurações da empresa (inclui logo)
  async atualizarConfiguracoesEmpresa(configuracoes: any): Promise<{ empresa: any }> {
    return this.makeRequest('/api/empresas/configuracoes', {
      method: 'PATCH',
      body: JSON.stringify({ configuracoes }),
    });
  }

  // Listar colaboradores da empresa
  async listarColaboradores(): Promise<{ colaboradores: any[]; total: number }> {
    return this.makeRequest('/api/empresas/colaboradores');
  }

  // Obter estatísticas da empresa
  async obterEstatisticasEmpresa(): Promise<{ estatisticas: any }> {
    return this.makeRequest('/api/empresas/estatisticas');
  }

  // Salvar resultado de teste psicológico
  async salvarResultadoTeste(dados: {
    testeId?: string | null;
    usuarioId?: string | null;
    pontuacaoTotal: number;
    tempoGasto?: number;
    sessionId?: string;
    metadados?: any;
    status?: string;
    userEmail?: string;
    empresaId?: string | null;
  }): Promise<{ id: string; pontuacaoTotal: number; dataRealizacao: string }> {
    const token = getAuthToken();
    const endpoint = token ? '/api/testes/resultado' : '/api/testes/resultado/anonimo';
    try {
      const response = await this.makeRequest<{ resultado: any }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      return response.resultado;
    } catch (err: any) {
      if (endpoint === '/api/testes/resultado' && (err?.status === 401 || err?.status === 403)) {
        const fallback = await this.makeRequest<{ resultado: any }>('/api/testes/resultado/anonimo', {
          method: 'POST',
          body: JSON.stringify(dados),
        });
        return fallback.resultado;
      }
      throw err;
    }
  }
  async obterDashboardAdmin(): Promise<any> {
    return this.makeRequest('/api/admin/dashboard');
  }

  // Indicadores agregados das empresas com compras/assinaturas
  async obterIndicadoresEmpresasComCompras(): Promise<{
    empresas: { total: number };
    testes: { total: number; mediaPontuacao: number; mediaPorEmpresa: number };
    analise: {
      tendencia: Array<{ mes: string; total: number }>;
      distribuicaoTemporal: Array<{ periodo: string; valor: number }>;
      porCategoria: Array<{ categoria: string; total: number }>;
    };
  }> {
    return this.makeRequest('/api/admin/empresas-com-compras/indicadores');
  }

  async obterConfiguracaoLimiteColaboradores(): Promise<{ limiteMaximo: number }> {
    try {
      // Endpoint sob /convites para manter contexto
      return await this.makeRequest('/api/convites/configuracoes/limite-colaboradores');
    } catch (error) {
      console.error('Erro ao buscar configuração de limite:', error);
      return { limiteMaximo: 1000 };
    }
  }

  // Métricas de convites da empresa
  async obterMetricasConvitesEmpresa(): Promise<{
    success: boolean;
    data: {
      limiteTotal: number;
      criados: number;
      usados: number;
      disponiveis: number;
      pendentes: number;
      cancelados: number;
    };
  }> {
    return this.makeRequest('/api/convites/metricas-empresa');
  }
}

export const apiService = new ApiService();
export type { ConviteEmpresa, ConviteColaborador, ConviteResponse, ApiResponse };
