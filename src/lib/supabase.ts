// NOTA: Supabase desabilitado - usando API local PostgreSQL

// Criação de um cliente mock para evitar erros em código legado
// Criação de um cliente mock para evitar erros em código legado
const createChainableMock = () => {
  const mock: any = {
    select: (...args: any[]) => mock,
    insert: (...args: any[]) => mock,
    update: (...args: any[]) => mock,
    delete: (...args: any[]) => mock,
    eq: (...args: any[]) => mock,
    neq: (...args: any[]) => mock,
    gt: (...args: any[]) => mock,
    lt: (...args: any[]) => mock,
    gte: (...args: any[]) => mock,
    lte: (...args: any[]) => mock,
    like: (...args: any[]) => mock,
    ilike: (...args: any[]) => mock,
    is: (...args: any[]) => mock,
    in: (...args: any[]) => mock,
    contains: (...args: any[]) => mock,
    range: (...args: any[]) => mock,
    limit: (...args: any[]) => mock,
    single: () => Promise.resolve({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    maybeSingle: () => Promise.resolve({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    order: (...args: any[]) => mock,
    rpc: (...args: any[]) => Promise.resolve({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    then: (resolve: any) => resolve({ data: null, error: new Error('Supabase desabilitado - use a API local') })
  };
  return mock;
};

export const supabase = {
  from: (table: string) => createChainableMock(),
  rpc: (fn: string, args?: any) => Promise.resolve({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
  auth: {
    signIn: (...args: any[]) => Promise.resolve({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  },
};

// Função utilitária para retry com backoff exponencial
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        console.error(`❌ [RETRY] Falha após ${maxRetries + 1} tentativas:`, lastError);
        throw lastError;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      console.warn(`⚠️ [RETRY] Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms:`, error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Função para verificar conexão (desabilitada)
export const testConnection = async () => {
  return { success: false, message: 'Supabase desabilitado - usando API local PostgreSQL' };
};
