import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { apiService } from '@/services/apiService';
import { hybridInvitationService } from '@/services/invitationServiceHybrid';

interface SituacaoPsicossocial {
  status: 'excelente' | 'bom' | 'atencao' | 'critico' | 'nao_avaliado';
  descricao: string;
  cor: string;
  totalTestes: number;
  ultimoTeste?: string;
  indicadores?: { nome: string; valor: string; nivel: string }[];
}

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  avatar?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  total_testes?: number;
  ultimo_teste?: string;
  situacaoPsicossocial?: SituacaoPsicossocial;
}

export default function EmpresaColaboradores() {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [filtroColaboradores, setFiltroColaboradores] = useState('');
  const [statusColaboradorFiltro, setStatusColaboradorFiltro] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [novoConvite, setNovoConvite] = useState({
    email: '',
    nome: '',
    cargo: '',
    departamento: '',
    dias_expiracao: 7
  });

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const carregarColaboradores = async () => {
    try {
      const isEmailValido = (email: string) => /.+@.+\..+/.test(email);

      const filtrarReais = (lista: any[]): Colaborador[] => {
        const unicos = new Map<string, Colaborador>();
        for (const c of lista) {
          const email = String(c.email || '').toLowerCase();
          if (!isEmailValido(email)) continue;
          if (!unicos.has(email)) unicos.set(email, c);
        }
        return Array.from(unicos.values());
      };

      // Preferir API oficial de empresa; fallback para authService (mock)
      let lista: any[] = [];
      try {
        const resp = await apiService.listarColaboradores();
        lista = Array.isArray(resp?.colaboradores) ? resp.colaboradores : [];
      } catch (_) {
        const response = await authService.getColaboradores();
        lista = response.success && Array.isArray(response.data) ? response.data : [];
      }

      const reais = filtrarReais(lista);
      const normalizados: Colaborador[] = reais.map((c: any) => {
        const cargoReal =
          (typeof c.cargo === 'string' && c.cargo.trim()) ? c.cargo :
          (typeof c.funcao === 'string' && c.funcao.trim()) ? c.funcao :
          (typeof c.role === 'string' && c.role.trim()) ? c.role :
          (typeof c.jobTitle === 'string' && c.jobTitle.trim()) ? c.jobTitle :
          (typeof c.cargo_nome === 'string' && c.cargo_nome.trim()) ? c.cargo_nome :
          (typeof c.perfil?.cargo === 'string' && c.perfil.cargo.trim()) ? c.perfil.cargo :
          undefined;

        const departamentoReal =
          (typeof c.departamento === 'string' && c.departamento.trim()) ? c.departamento :
          (typeof c.setor === 'string' && c.setor.trim()) ? c.setor :
          (typeof c.department === 'string' && c.department.trim()) ? c.department :
          (typeof c.departamento_nome === 'string' && c.departamento_nome.trim()) ? c.departamento_nome :
          (typeof c.area === 'string' && c.area.trim()) ? c.area :
          (typeof c.perfil?.departamento === 'string' && c.perfil.departamento.trim()) ? c.perfil.departamento :
          undefined;

        return {
          id: c.id,
          nome: typeof c.nome === 'string' && c.nome.length > 0 ? c.nome : (c.name || 'Sem nome'),
          email: typeof c.email === 'string' && c.email.length > 0 ? c.email : 'sem-email@local',
          cargo: cargoReal,
          departamento: departamentoReal,
          avatar: c.avatar,
          ativo: Boolean(c.ativo ?? c.status === 'ativo'),
          created_at: (typeof c.created_at !== 'undefined' && c.created_at !== null) ? c.created_at : (c.createdAt ?? c.created_at),
          updated_at: (typeof c.updated_at !== 'undefined' && c.updated_at !== null) ? c.updated_at : (c.updatedAt ?? c.updated_at),
          total_testes: (typeof c.total_testes === 'number') ? c.total_testes : (typeof c.totalTestes === 'number' ? c.totalTestes : 0),
          ultimo_teste: c.ultimo_teste ?? c.ultimoTeste ?? undefined,
          situacaoPsicossocial: c.situacaoPsicossocial,
        };
      });
      console.log('🔍 [FRONT] Colaboradores normalizados:', normalizados.map(c => ({ nome: c.nome, email: c.email, created_at: c.created_at })));
      setColaboradores(normalizados);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast.error('Erro ao carregar colaboradores');
    }
  };

  const criarConviteColaborador = async () => {
    try {
      if (!novoConvite.email || !novoConvite.nome) {
        toast.error('Email e nome são obrigatórios');
        return;
      }

      const user = authService.getCurrentUser();
      if (!user?.empresaId) return;

      const response = await hybridInvitationService.criarConviteColaborador({
        email: novoConvite.email,
        nome: novoConvite.nome,
        empresa_id: user.empresaId,
        dias_expiracao: novoConvite.dias_expiracao
      });

      if (response.success) {
        toast.success('Convite criado com sucesso!');
        
        // Gerar URL do convite
        const urlConvite = hybridInvitationService.gerarUrlConvite(response.token!, 'colaborador');
        
        // Copiar para clipboard
        navigator.clipboard.writeText(urlConvite);
        toast.info('URL do convite copiada para a área de transferência');
        
        setShowConviteModal(false);
        setNovoConvite({ email: '', nome: '', cargo: '', departamento: '', dias_expiracao: 7 });
        carregarColaboradores();
      } else {
        toast.error(response.message || 'Erro ao criar convite');
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao criar convite');
    }
  };

  const handleColaboradorClick = (colaboradorId: string) => {
    navigate(`/empresa/colaborador/${colaboradorId}/resultados`);
  };

  const formatarData = (data: any) => {
    if (!data) return '—';
    const d = data instanceof Date ? data : new Date(data);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excelente':
        return <CheckCircle className="w-4 h-4" />;
      case 'bom':
        return <Activity className="w-4 h-4" />;
      case 'atencao':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critico':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCorStatus = (cor: string) => {
    switch (cor) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const colaboradoresFiltrados = colaboradores.filter(colaborador => {
      const matchesSearch = (colaborador.nome || '').toLowerCase().includes(filtroColaboradores.toLowerCase()) ||
                         (colaborador.email || '').toLowerCase().includes(filtroColaboradores.toLowerCase()) ||
                         (colaborador.cargo && colaborador.cargo.toLowerCase().includes(filtroColaboradores.toLowerCase())) ||
                         (colaborador.departamento && colaborador.departamento.toLowerCase().includes(filtroColaboradores.toLowerCase()));
    
    const matchesStatus = statusColaboradorFiltro === 'todos' || 
                         (statusColaboradorFiltro === 'ativo' && colaborador.ativo) ||
                         (statusColaboradorFiltro === 'inativo' && !colaborador.ativo);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-600">Gerencie todos os colaboradores da sua empresa</p>
        </div>
        <button
          onClick={() => setShowConviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Colaborador</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar colaboradores..."
                value={filtroColaboradores}
                onChange={(e) => setFiltroColaboradores(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusColaboradorFiltro}
              onChange={(e) => setStatusColaboradorFiltro(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Colaboradores */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo/Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Testes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situação Psicossocial
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {colaboradoresFiltrados.map((colaborador) => (
                <tr 
                  key={colaborador.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleColaboradorClick(colaborador.id)}
                  title="Clique para ver os resultados dos testes"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {colaborador.avatar ? (
                          <img 
                            src={colaborador.avatar} 
                            alt={colaborador.nome}
                            className="h-10 w-10 rounded-full object-cover border-2 border-blue-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {colaborador.nome}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {colaborador.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {colaborador.cargo || 'Não informado'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {colaborador.departamento || 'Não informado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      colaborador.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {colaborador.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatarData(colaborador.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-sm text-gray-900">
                      {colaborador.situacaoPsicossocial?.totalTestes || 0} realizados
                    </div>
                    {colaborador.situacaoPsicossocial?.ultimoTeste && (
                      <div className="text-xs text-gray-500">
                        Último: {formatarData(colaborador.situacaoPsicossocial.ultimoTeste)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4" data-testid={`situacao-psicossocial-${colaborador.id}`}>
                    {colaborador.situacaoPsicossocial ? (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getCorStatus(colaborador.situacaoPsicossocial.cor)}`}>
                        {getStatusIcon(colaborador.situacaoPsicossocial.status)}
                        <span className="text-xs font-semibold">
                          {colaborador.situacaoPsicossocial.descricao}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        Aguardando testes
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizar resultados"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColaboradorClick(colaborador.id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Editar"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="Mais opções"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {colaboradoresFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum colaborador encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtroColaboradores || statusColaboradorFiltro !== 'todos' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece convidando um novo colaborador.'}
            </p>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{colaboradores.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Ativos</p>
              <p className="text-lg font-semibold text-gray-900">
                {colaboradores.filter(c => c.ativo).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inativos</p>
              <p className="text-lg font-semibold text-gray-900">
                {colaboradores.filter(c => !c.ativo).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite */}
      {showConviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Convidar Novo Colaborador</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Colaborador
                </label>
                <input
                  type="text"
                  value={novoConvite.nome}
                  onChange={(e) => setNovoConvite({...novoConvite, nome: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome do colaborador"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={novoConvite.email}
                  onChange={(e) => setNovoConvite({...novoConvite, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@colaborador.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo (Opcional)
                </label>
                <input
                  type="text"
                  value={novoConvite.cargo}
                  onChange={(e) => setNovoConvite({...novoConvite, cargo: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Analista, Gerente, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento (Opcional)
                </label>
                <input
                  type="text"
                  value={novoConvite.departamento}
                  onChange={(e) => setNovoConvite({...novoConvite, departamento: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: RH, TI, Vendas, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias para Expiração
                </label>
                <select
                  value={novoConvite.dias_expiracao}
                  onChange={(e) => setNovoConvite({...novoConvite, dias_expiracao: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={3}>3 dias</option>
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowConviteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={criarConviteColaborador}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
