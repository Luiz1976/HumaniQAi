import { authService } from './authService';
import { apiRequest } from '@/lib/queryClient';

export interface ColaboradorCompleto {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  avatar?: string;
  empresaId: string;
  permissoes: any;
  ativo: boolean;
  createdAt: string;
}

class ColaboradorService {
  async getDadosColaboradorLogado(): Promise<ColaboradorCompleto | null> {
    try {
      console.log('🔍 [ColaboradorService] Iniciando busca por dados do colaborador logado...');
      const user = authService.getCurrentUser();
      if (!user || user.role !== 'colaborador') {
        return null;
      }
      
      const data = await apiRequest<{ colaborador: ColaboradorCompleto }>('/api/colaboradores/me');
      console.log('✅ [ColaboradorService] Colaborador encontrado com sucesso:', data.colaborador);
      
      return data.colaborador;
    } catch (error) {
      console.error('❌ [ColaboradorService] Erro geral:', error);
      return null;
    }
  }

  /**
   * Atualiza dados do colaborador
   */
  async atualizarColaborador(id: string, dados: Partial<ColaboradorCompleto>): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('Nenhum token encontrado');
        return false;
      }

      await apiRequest(`/api/colaboradores/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      return true;
    } catch (error) {
      console.error('Erro no serviço de atualização:', error);
      return false;
    }
  }
}

export const colaboradorService = new ColaboradorService();
