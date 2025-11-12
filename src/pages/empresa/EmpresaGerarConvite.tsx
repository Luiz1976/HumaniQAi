import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Calendar, Clock, CheckCircle, AlertTriangle, Copy, Send, Eye, Trash2, Plus, Upload, FileSpreadsheet, Link as LinkIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Dialog imports removed - ERP functionality deleted
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { hybridInvitationService } from '../../services/invitationServiceHybrid';
import { apiService } from '@/services/apiService';
import { useAuth } from '../../hooks/AuthContext';
import { StatusConvite } from '../../lib/enums';

interface ConviteColaborador {
  id: string;
  token: string;
  email: string;
  nome: string;
  status: StatusConvite;
  validade: string;
  created_at: string;
}

// ERP interfaces removed - functionality deleted

  interface ColaboradorPlanilha {
    nome: string;
    cargo: string;
    setor: string;
    idade: number;
    sexo: string;
    email: string;
  }

interface ConviteGerado {
  nome: string;
  cargo: string;
  setor: string;
  link: string;
}

const EmpresaGerarConvite: React.FC = () => {
  const [convites, setConvites] = useState<ConviteColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNovoConviteModal, setShowNovoConviteModal] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | StatusConvite>('todos');
  const [novoConvite, setNovoConvite] = useState({
    email: '',
    nome: '',
    cargo: '',
    departamento: '',
    dias_expiracao: 7
  });
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const { user } = useAuth();
  
  // Estados para importação via Excel
  const [processandoPlanilha, setProcessandoPlanilha] = useState(false);
  const [convitesGerados, setConvitesGerados] = useState<ConviteGerado[]>([]);
  const [showConvitesGerados, setShowConvitesGerados] = useState(false);
  const [metricas, setMetricas] = useState<{ limiteTotal: number; criados: number; usados: number; disponiveis: number; pendentes: number; cancelados: number } | null>(null);

  useEffect(() => {
    carregarConvites();
    carregarMetricas();
  }, []);

  const carregarMetricas = async () => {
    try {
      const resposta = await apiService.obterMetricasConvitesEmpresa();
      if (resposta?.success && resposta?.data) {
        setMetricas(resposta.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métricas de convites da empresa:', error);
    }
  };

  // ERP functionality removed - ERP login function deleted

  // ERP functionality removed - bulk invite function deleted

  // ERP functionality removed - selection toggle functions deleted

  // Funções para importação via Excel
  const baixarModeloPlanilha = () => {
    // Baixar modelo XLSX estático hospedado em /public
    const url = '/modelo_convites_colaboradores.xlsx';
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_convites_colaboradores.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Modelo Excel baixado com sucesso!', {
      description: 'Preencha a planilha e faça o upload',
    });
  };

  const processarPlanilha = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ [EXCEL] Nenhum arquivo selecionado');
      return;
    }

    console.log('📄 [EXCEL] Arquivo selecionado:', file.name, file.size, 'bytes');

    try {
      setProcessandoPlanilha(true);

      // Ler arquivo
      console.log('📖 [EXCEL] Lendo arquivo...');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      console.log(`✅ [EXCEL] Planilha lida: ${jsonData.length} linhas encontradas`);

      if (jsonData.length === 0) {
        toast.error('Planilha vazia', {
          description: 'A planilha não contém dados',
        });
        return;
      }

      // Validar colunas
      const primeiraLinha = jsonData[0];
      // Campos essenciais: Nome, Cargo, Setor (Departamento) e Email
      const colunasObrigatorias = ['Nome', 'Cargo', 'Setor', 'Email'];
      const colunasFaltando = colunasObrigatorias.filter(col => !primeiraLinha.hasOwnProperty(col));

      console.log('📋 [EXCEL] Colunas encontradas:', Object.keys(primeiraLinha));
      console.log('📋 [EXCEL] Colunas obrigatórias:', colunasObrigatorias);

      if (colunasFaltando.length > 0) {
        console.error('❌ [EXCEL] Colunas faltando:', colunasFaltando);
        toast.error('Planilha inválida', {
          description: `Colunas faltando: ${colunasFaltando.join(', ')}`,
        });
        return;
      }

      // Validar presença e formato de Email em todas as linhas
      const linhasSemEmail = jsonData.filter(linha => !linha.Email || String(linha.Email).trim() === '');
      if (linhasSemEmail.length > 0) {
        toast.error('Planilha inválida', {
          description: 'A coluna Email é obrigatória em todas as linhas',
        });
        return;
      }

      const isValidEmail = (email: string) => /.+@.+\..+/.test(email);
      const linhasEmailInvalido = jsonData.filter(linha => !isValidEmail(String(linha.Email).trim()));
      if (linhasEmailInvalido.length > 0) {
        toast.error('Emails inválidos na planilha', {
          description: 'Corrija os emails inválidos antes de continuar',
        });
        return;
      }

      // Processar dados e gerar convites
      if (!user?.empresaId) {
        console.error('❌ [EXCEL] ID da empresa não encontrado');
        toast.error('ID da empresa não encontrado');
        return;
      }

      console.log('🏢 [EXCEL] ID da empresa:', user.empresaId);

      // Ignorar Idade/Sexo da planilha; processar apenas os essenciais
      const convitesParaGerar = jsonData.map((linha: any) => ({
        nome: String(linha.Nome || '').trim(),
        cargo: String(linha.Cargo || '').trim(),
        setor: String(linha.Setor || '').trim(),
        email: String(linha.Email || '').trim(),
      }));

      // Filtrar linhas vazias
      const colaboradoresValidos = convitesParaGerar.filter(c => c.nome && c.cargo && c.setor && c.email && isValidEmail(c.email));

      console.log(`✅ [EXCEL] Colaboradores válidos: ${colaboradoresValidos.length} de ${convitesParaGerar.length}`);

      if (colaboradoresValidos.length === 0) {
        toast.error('Nenhum colaborador válido encontrado', {
          description: 'Verifique os dados da planilha',
        });
        return;
      }

      // Gerar convites
      const convitesComLinks: ConviteGerado[] = [];
      const erros: string[] = [];

      // Verificar limite antes de processar em massa
      // Bloquear apenas quando há limite configurado (> 0) e não há disponíveis
      if (metricas && metricas.limiteTotal > 0 && metricas.disponiveis <= 0) {
        toast.error('Limite de convites atingido', {
          description: `Limite contratado: ${metricas.limiteTotal}. Importação bloqueada.`
        });
        return;
      }

      // Calcular o máximo a criar: se limiteTotal = 0 (não definido/sem limite), permitir todos os válidos
      const limiteTotal = metricas?.limiteTotal ?? 0;
      const disponiveisAgora = metricas?.disponiveis ?? undefined;
      const semLimite = limiteTotal <= 0;
      const maxCriar = semLimite ? colaboradoresValidos.length : Math.max(0, disponiveisAgora || 0);
      const colaboradoresParaCriar = colaboradoresValidos.slice(0, maxCriar);

      for (const colaborador of colaboradoresParaCriar) {
        try {
          console.log(`📤 [EXCEL] Gerando convite para: ${colaborador.nome}`);
          
          const authToken = localStorage.getItem('authToken');
          console.log('🔐 [EXCEL] Token presente?', !!authToken, 'len:', authToken?.length || 0);

          const response = await fetch('/api/convites/colaborador', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({
              nome: colaborador.nome,
              email: colaborador.email,
              cargo: colaborador.cargo,
              departamento: colaborador.setor,
              diasValidade: 30,
            }),
          });

          const rawText = await response.text();
          console.log(`📥 [EXCEL] HTTP ${response.status} para ${colaborador.nome}:`, rawText);
          let data: any;
          try { data = JSON.parse(rawText); } catch { data = { error: rawText }; }

          if (data.success && data.data?.token) {
            const linkConvite = `${window.location.origin}/convite/colaborador/${data.data.token}`;
            convitesComLinks.push({
              nome: colaborador.nome,
              cargo: colaborador.cargo,
              setor: colaborador.setor,
              link: linkConvite,
            });
            console.log(`✅ [EXCEL] Convite criado para: ${colaborador.nome}`);
          } else {
            const erro = data.error || data.message || 'Erro desconhecido';
            console.error(`❌ [EXCEL] Falha para ${colaborador.nome}:`, erro);
            erros.push(`${colaborador.nome}: ${erro}`);
          }
        } catch (error) {
          console.error(`❌ [EXCEL] Exceção ao gerar convite para ${colaborador.nome}:`, error);
          erros.push(`${colaborador.nome}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      console.log(`📊 [EXCEL] Resultado final: ${convitesComLinks.length} convites criados, ${erros.length} erros`);

      if (erros.length > 0) {
        console.error('❌ [EXCEL] Erros encontrados:', erros);
      }

      setConvitesGerados(convitesComLinks);
      setShowConvitesGerados(true);

      if (convitesComLinks.length > 0) {
        toast.success('Convites gerados!', {
          description: `${convitesComLinks.length} de ${colaboradoresValidos.length} convites processados${erros.length > 0 ? ` (${erros.length} falhas)` : ''}`,
        });
      } else {
        toast.error('Nenhum convite foi criado', {
          description: erros.length > 0 ? erros[0] : 'Erro desconhecido',
        });
      }

      // Limpar input
      event.target.value = '';
      
      // Recarregar lista de convites
      if (convitesComLinks.length > 0) {
        carregarConvites();
        carregarMetricas();
      }
    } catch (error) {
      console.error('❌ [EXCEL] Erro fatal ao processar planilha:', error);
      toast.error('Erro ao processar planilha', {
        description: error instanceof Error ? error.message : 'Verifique se o arquivo está no formato correto',
      });
    } finally {
      setProcessandoPlanilha(false);
    }
  };

  const copiarLink = (link: string, nome: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!', {
      description: `Link de ${nome} copiado para área de transferência`,
    });
  };

  const copiarTodosLinks = () => {
    const todosLinks = convitesGerados.map(c => `${c.nome}: ${c.link}`).join('\n\n');
    navigator.clipboard.writeText(todosLinks);
    toast.success('Todos os links copiados!', {
      description: `${convitesGerados.length} links copiados para área de transferência`,
    });
  };

  // Tokens cancelados localmente (para ocultar no grid mesmo após reload)
  const [tokensCancelados, setTokensCancelados] = useState<string[]>([]);

  const carregarConvites = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando convites da empresa...');
      
      if (!user?.empresaId) {
        console.error('❌ ID da empresa não encontrado');
        toast.error('Erro ao carregar convites', {
          description: 'ID da empresa não encontrado'
        });
        return;
      }

      const response = await hybridInvitationService.listarConvites('colaborador', user.empresaId);
      console.log('✅ Convites carregados:', response);
      
      if (response.success && response.data) {
        setConvites(response.data as ConviteColaborador[]);
      } else {
        console.error('❌ Erro na resposta:', response.message);
        setConvites([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar convites:', error);
      toast.error('Erro ao carregar convites', {
        description: 'Tente novamente em alguns instantes'
      });
      setConvites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarConvite = async () => {
    try {
      setEnviandoConvite(true);

      if (!user?.empresaId) {
        toast.error('ID da empresa não encontrado');
        return;
      }

      if (!novoConvite.email || !novoConvite.nome) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const authToken = localStorage.getItem('authToken');
      console.log('🔐 [UI] Token presente?', !!authToken, 'len:', authToken?.length || 0);

      const response = await fetch('/api/convites/colaborador', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          nome: novoConvite.nome,
          email: novoConvite.email,
          cargo: novoConvite.cargo,
          departamento: novoConvite.departamento,
          empresa_id: user.empresaId,
          dias_expiracao: novoConvite.dias_expiracao
        }),
      });

      const rawText = await response.text();
      console.log('📥 [UI] HTTP', response.status, 'body:', rawText);
      let data: any;
      try { data = JSON.parse(rawText); } catch { data = { error: rawText }; }

      if (data.success) {
        toast.success('Convite criado com sucesso!', {
          description: `Enviado para ${novoConvite.email}`
        });
        setShowNovoConviteModal(false);
        setNovoConvite({
          email: '',
          nome: '',
          cargo: '',
          departamento: '',
          dias_expiracao: 7
        });
        carregarConvites();
        carregarMetricas();
      } else {
        toast.error('Erro ao criar convite', {
          description: data.message || 'Erro desconhecido'
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar convite:', error);
      toast.error('Erro ao criar convite', {
        description: 'Tente novamente em alguns instantes'
      });
    } finally {
      setEnviandoConvite(false);
    }
  };

  const handleCopiarLink = (token: string) => {
    const link = `${window.location.origin}/aceitar-convite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!', {
      description: 'Link do convite copiado para a área de transferência'
    });
  };

  const handleDeletarConvite = async (token: string) => {
    try {
      console.log('[UI] [Delete] Clique na lixeira. Token:', token);
      const antes = convites.length;
      console.log('[UI] [Delete] Convites antes:', antes, 'preview primeiros:', convites.slice(0,3).map(c=>({id:c.id,token:c.token,status:c.status})));

      const response = await hybridInvitationService.cancelarConvite(token, 'colaborador');
      console.log('[UI] [Delete] Resposta cancelarConvite:', response);

      if (response.success) {
        toast.success('Convite cancelado e excluído com sucesso');
        // Remoção otimista imediata pelo token
        setConvites(prev => {
          const filtrados = prev.filter(c => c.token !== token);
          console.log('[UI] [Delete] Remoção otimista. Antes:', prev.length, 'Depois:', filtrados.length);
          return filtrados;
        });
        // Marcar token como cancelado para ocultar mesmo após reload
        setTokensCancelados(prev => [...prev, token]);
        // Sincronizar com backend em background (não reexibir o item se voltar)
        void carregarConvites();
      } else {
        toast.error(response.message || 'Erro ao cancelar convite');
      }
    } catch (error) {
      console.error('[UI] [Delete] Erro ao cancelar convite:', error);
      toast.error('Erro ao cancelar convite');
    }
  };

  const getStatusConvite = (convite: ConviteColaborador): StatusConvite => {
    // Tratar estados explícitos vindos do backend
    if (convite.status === StatusConvite.CANCELADO) return StatusConvite.CANCELADO;
    if (convite.status === StatusConvite.ACEITO) return StatusConvite.ACEITO;

    // Derivar expiração pela validade
    const agora = new Date();
    const validade = new Date(convite.validade);
    if (agora > validade) return StatusConvite.EXPIRADO;

    return StatusConvite.PENDENTE;
  };

  const getStatusBadge = (status: StatusConvite) => {
    switch (status) {
      case StatusConvite.PENDENTE:
        return <Badge className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">Pendente</Badge>;
      case StatusConvite.ACEITO:
        return <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">Aceito</Badge>;
      case StatusConvite.EXPIRADO:
        return <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/30">Expirado</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300">Desconhecido</Badge>;
    }
  };

  const convitesFiltrados = convites.filter(convite => {
    const matchFiltro = !filtro || 
      convite.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      convite.email.toLowerCase().includes(filtro.toLowerCase());
    
    const status = getStatusConvite(convite);
    const matchStatus = statusFiltro === 'todos' || status === statusFiltro;
    // Ocultar sempre convites cancelados (não há filtro para eles neste componente)
    const naoCancelado = status !== StatusConvite.CANCELADO;
    // Também ocultar tokens marcados localmente como cancelados
    const naoTokenCanceladoLocal = !tokensCancelados.includes(convite.token);
    return matchFiltro && matchStatus && naoCancelado && naoTokenCanceladoLocal;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white/60">Carregando convites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-300 font-medium">Sistema Ativo e Operacional</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Central de Convites Inteligente
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Escolha o método ideal para sua empresa e gere convites profissionais em segundos.
            <span className="block text-purple-300 font-medium mt-2">
              3 formas poderosas, resultados imediatos.
            </span>
          </p>
        </div>

        {/* Seção numerada integrada diretamente acima de cada método */}

        <div className="space-y-6 mb-8">
          {/* Número 1 - acima do Card Individual */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Convite Individual</h3>
            <p className="text-white/60 text-sm">Personalização total para colaboradores específicos</p>
          </div>
          {/* CARD 1: Convites Individuais */}
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group">
            <CardHeader className="border-b border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl text-white" data-testid="text-card-individual-title">Convite Personalizado</CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">Método 1</Badge>
                  </div>
                  <CardDescription className="text-white/70 leading-relaxed">
                    <strong className="text-purple-300">Atenção individual,</strong> resultados excepcionais.
                    <br />
                    Ideal para colaboradores VIP e casos especiais.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Painel de Métricas */}
              {metricas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-white/80 text-sm">Convites disponíveis</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{metricas.disponiveis}</span>
                      <span className="text-xs text-white/50">Limite: {metricas.limiteTotal > 0 ? metricas.limiteTotal : 'não definido'}</span>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-green-500"
                          style={{ width: `${Math.min(100, (metricas.disponiveis / (metricas.limiteTotal || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <span className="text-white/80 text-sm">Convites criados</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{metricas.criados}</span>
                      <span className="text-xs text-white/50">de {metricas.limiteTotal > 0 ? metricas.limiteTotal : 'sem limite'}</span>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-blue-500"
                          style={{ width: `${Math.min(100, (metricas.criados / (metricas.limiteTotal || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span className="text-white/80 text-sm">Convites utilizados</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{metricas.usados}</span>
                      <span className="text-xs text-white/50">pendentes: {metricas.pendentes}</span>
                    </div>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-emerald-500"
                          style={{ width: `${Math.min(100, (metricas.usados / (metricas.criados || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 mb-6 font-semibold text-base py-6 transition-all duration-300"
                data-testid="button-novo-convite"
                onClick={() => setShowNovoConviteModal(true)}
                disabled={metricas ? (metricas.limiteTotal > 0 && metricas.disponiveis <= 0) : false}
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Convite Agora
              </Button>

              {showNovoConviteModal && (
                <div className="sm:max-w-md w-full rounded-xl border border-white/20 bg-black/30 backdrop-blur p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white">Criar Novo Convite</h2>
                    <p className="text-sm text-white/70">Preencha os dados do colaborador para gerar o convite</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        placeholder="João Silva"
                        value={novoConvite.nome}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, nome: e.target.value }))}
                        data-testid="input-nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao@empresa.com"
                        value={novoConvite.email}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, email: e.target.value }))}
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        placeholder="Analista"
                        value={novoConvite.cargo}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, cargo: e.target.value }))}
                        data-testid="input-cargo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        placeholder="TI"
                        value={novoConvite.departamento}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, departamento: e.target.value }))}
                        data-testid="input-departamento"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dias_expiracao">Dias de Validade</Label>
                      <Input
                        id="dias_expiracao"
                        type="number"
                        min="1"
                        max="30"
                        value={novoConvite.dias_expiracao}
                        onChange={(e) => setNovoConvite(prev => ({ ...prev, dias_expiracao: parseInt(e.target.value) }))}
                        data-testid="input-dias-expiracao"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setShowNovoConviteModal(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCriarConvite}
                        disabled={enviandoConvite || !novoConvite.email || !novoConvite.nome}
                        data-testid="button-enviar-convite"
                      >
                        {enviandoConvite ? 'Enviando...' : 'Enviar Convite'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Total</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-convites">{convites.length}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Pendentes</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-pendentes">
                    {convites.filter(c => getStatusConvite(c) === StatusConvite.PENDENTE).length}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Usados</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-usados">
                    {convites.filter(c => getStatusConvite(c) === StatusConvite.ACEITO).length}
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-white/60">Expirados</p>
                  <p className="text-2xl font-bold text-white" data-testid="text-expirados">
                    {convites.filter(c => getStatusConvite(c) === StatusConvite.EXPIRADO).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* CARD REMOVIDO: ERP - Funcionalidade removida conforme documentação */}
          {/* Número 2 - acima do Card Excel */}
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">2</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Importação Excel</h3>
            <p className="text-white/60 text-sm">Escala e praticidade em segundos</p>
          </div>

          {/* CARD 3: Importação via Planilha Excel */}
          <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 group">
            <CardHeader className="border-b border-white/10 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl text-white" data-testid="text-card-excel-title">Importação em Massa</CardTitle>
                    <Badge className="bg-orange-500/20 text-orange-300 text-xs">Método 2</Badge>
                  </div>
                  <CardDescription className="text-white/70 leading-relaxed">
                    <strong className="text-orange-300">Escala total,</strong> centenas em minutos.
                    <br />
                    Perfeito para onboarding de grandes equipes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {showConvitesGerados ? (
                <div className="space-y-4">
                  {/* Header com total e botão fechar */}
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">
                      {convitesGerados.length} convites gerados
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={copiarTodosLinks}
                        variant="outline"
                        className="text-orange-400 border-orange-400/50 hover:bg-orange-400/10"
                        size="sm"
                        data-testid="button-copiar-todos-links"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Todos
                      </Button>
                      <Button
                        onClick={() => {
                          setShowConvitesGerados(false);
                          setConvitesGerados([]);
                        }}
                        variant="ghost"
                        className="text-white/60 hover:text-white"
                        size="sm"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>

                  {/* Lista de links gerados */}
                  <div className="bg-white/5 border border-white/10 rounded-lg max-h-96 overflow-y-auto">
                    {convitesGerados.map((convite, index) => (
                      <div 
                        key={index}
                        className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                        data-testid={`convite-gerado-${index}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{convite.nome}</p>
                            <p className="text-white/60 text-sm">{convite.cargo} • {convite.setor}</p>
                            <p className="text-white/40 text-xs mt-1 truncate">{convite.link}</p>
                          </div>
                          <Button
                            onClick={() => copiarLink(convite.link, convite.nome)}
                            variant="ghost"
                            size="sm"
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 flex-shrink-0"
                            data-testid={`button-copiar-link-${index}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert className="bg-orange-500/10 border-orange-500/20">
                    <AlertDescription className="text-white/80 text-sm">
                      <strong>Próximos passos:</strong> Copie os links e envie para cada colaborador por email, WhatsApp ou outro meio de comunicação.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Seção 1: Download do Modelo */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 font-medium text-sm">Passo 1: Obtenha o Modelo</span>
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">Gratuito</Badge>
                    </div>
                    <Button 
                      onClick={baixarModeloPlanilha}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg hover:shadow-orange-500/50 font-semibold text-base py-6 transition-all duration-300"
                      data-testid="button-baixar-modelo"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Baixar Modelo Excel
                    </Button>
                    <p className="text-white/50 text-xs text-center">Arquivo .XLSX com 6 colunas prontas</p>
                  </div>

                  {/* Divisor */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 px-4 text-sm text-white/40">Em seguida</span>
                    </div>
                  </div>

                  {/* Seção 2: Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 font-medium text-sm">Passo 2: Faça o Upload</span>
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">Automático</Badge>
                    </div>
                    
                    {/* Upload Area */}
                    <div className="relative">
                      <input
                        id="upload-excel"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={processarPlanilha}
                        disabled={processandoPlanilha}
                        className="hidden"
                        data-testid="input-upload-excel"
                      />
                      <label 
                        htmlFor="upload-excel"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-500/30 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Upload className="h-8 w-8 text-orange-400 group-hover:text-orange-300 transition-colors" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-white/90">
                              Clique para selecionar o arquivo
                            </p>
                            <p className="text-xs text-white/50 mt-1">
                              ou arraste e solte aqui
                            </p>
                            <p className="text-xs text-orange-400/80 mt-2">
                              Arquivos .XLSX ou .XLS
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Status de processamento */}
                    {processandoPlanilha && (
                      <div className="flex items-center gap-3 text-orange-300 text-sm bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent" />
                        <div>
                          <p className="font-medium">Processando planilha...</p>
                          <p className="text-xs text-white/60 mt-0.5">Gerando convites automaticamente</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-white/10"></div>

                  {/* Seção 3: Informações */}
                  <div className="space-y-4">
                    {/* Requisitos do Arquivo */}
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                      <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-orange-400" />
                        Requisitos da Planilha
                      </h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                          <p className="text-xs text-white/50 mb-1">Formato</p>
                          <p className="text-white font-bold">.XLSX</p>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                          <p className="text-xs text-white/50 mb-1">Colunas</p>
                          <p className="text-white font-bold">5</p>
                        </div>
                      </div>
                      <div className="text-xs text-white/60 space-y-1">
                        <p>✓ Nome, Cargo, Setor, Idade, Sexo</p>
                        <p>✓ Preencha todos os campos</p>
                        <p>✓ Uma linha por colaborador</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista de Convites Existentes */}
        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Convites Criados</CardTitle>
            <CardDescription className="text-white/60">
              Gerencie todos os convites enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  data-testid="input-filtro"
                />
                <Select value={statusFiltro} onValueChange={(value: any) => setStatusFiltro(value)}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white" data-testid="select-status-filtro">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value={StatusConvite.PENDENTE}>Pendentes</SelectItem>
                    <SelectItem value={StatusConvite.ACEITO}>Aceitos</SelectItem>
                    <SelectItem value={StatusConvite.EXPIRADO}>Expirados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {convitesFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-16 w-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Nenhum convite encontrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {convitesFiltrados.map((convite) => {
                    const status = getStatusConvite(convite);
                    return (
                      <div
                        key={convite.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                        data-testid={`convite-${convite.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">{convite.nome}</h3>
                              {getStatusBadge(status)}
                            </div>
                            <p className="text-sm text-white/60 mb-1">
                              <Mail className="inline h-3 w-3 mr-1" />
                              {convite.email}
                            </p>
                            <p className="text-xs text-white/40">
                              <Calendar className="inline h-3 w-3 mr-1" />
                              Expira em: {new Date(convite.validade).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopiarLink(convite.token)}
                                className="bg-white/5 border-white/20 hover:bg-white/10 text-white"
                                data-testid={`button-copiar-${convite.id}`}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletarConvite(convite.token)}
                                className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
                                data-testid={`button-deletar-${convite.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmpresaGerarConvite;
