import { useState, useEffect } from 'react';
import { Heart, Shield, Users, TrendingUp, AlertCircle, CheckCircle, Activity, Target, Sparkles, Lock, Info, ChevronRight, ArrowRight, Star, Zap, Eye, Award, Clock } from 'lucide-react';
import Logo from "@/components/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import RiskGauge from '@/components/RiskGauge';
import Cookies from 'js-cookie';
import { authServiceNew } from '@/services/authServiceNew';

interface PsychosocialAnalysis {
  indiceGeralBemEstar: number;
  totalColaboradores: number;
  totalTestesRealizados: number;
  testesUltimos30Dias: number;
  cobertura: number;
  dimensoes: Array<{
    dimensaoId: string;
    nome: string;
    percentual: number;
    nivel: string;
    cor: string;
    total: number;
  }>;
  nr1Fatores: Array<{
    fator: string;
    nivel: string;
    percentual: number;
  }>;
  nr1Compliance: {
    status: string;
    ultimaAvaliacao: string | null;
    proximaAvaliacao: string;
    testesRealizados: number;
    cobertura: number;
  };
  alertasCriticos: string[];
  recomendacoes: Array<{
    categoria: string;
    prioridade: string;
    titulo: string;
    descricao: string;
  }>;
  ultimaAtualizacao: string;
}

function getWellbeingMessage(score: number): { title: string; message: string; color: string } {
  if (score >= 75) {
    return {
      title: "Ambiente Psicossocial Excepcional",
      message: "Sua organização cultiva um espaço onde as pessoas florescem. Continue nutrindo esse ecossistema de bem-estar.",
      color: "from-emerald-500 to-teal-600"
    };
  } else if (score >= 60) {
    return {
      title: "Caminho Promissor de Evolução",
      message: "Você está construindo algo especial. Pequenos ajustes podem transformar um bom ambiente em extraordinário.",
      color: "from-blue-500 to-indigo-600"
    };
  } else if (score >= 40) {
    return {
      title: "Momento de Transformação",
      message: "Cada desafio é uma oportunidade disfarçada. Vamos juntos converter esses dados em ações que transformam vidas.",
      color: "from-amber-500 to-orange-600"
    };
  } else {
    return {
      title: "Tempo de Cuidado Urgente",
      message: "Seus colaboradores precisam de você agora. Este é o momento de agir com coragem e compaixão.",
      color: "from-rose-500 to-red-600"
    };
  }
}

function CircularProgress({ value, size = 160, strokeWidth = 12, label, sublabel }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 75) return "#10b981";
    if (val >= 60) return "#3b82f6";
    if (val >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 8px ${getColor(value)}40)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-black bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          {value}%
        </div>
        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-500">
          {sublabel}
        </div>
      </div>
    </div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <div className="text-5xl font-black bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
      {value}{suffix}
    </div>
  );
}

export default function EmpresaEstadoPsicossocial() {
  const [analise, setAnalise] = useState<PsychosocialAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState("ia");

  useEffect(() => {
    const carregarAnalise = async () => {
      // Obter token de forma centralizada com fallback para cookies/localStorage
      const token = authServiceNew.getToken() || Cookies.get('authToken') || localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ [EmpresaEstadoPsicossocial] Token não encontrado');
        setError(new Error('Token não encontrado. Faça login novamente.'));
        toast.error('Sessão não encontrada. Redirecionando para login...');
        setIsLoading(false);
        // Redirecionar para página de login
        window.location.href = '/login';
        return;
      }

      console.log('🔍 [EmpresaEstadoPsicossocial] Iniciando carregamento...');
      setIsLoading(true);
      setError(null);

      try {
        // Validação prévia do token para evitar 403 e limpar sessão inválida
        try {
          const apiBase = (() => {
            const envRaw = import.meta.env.VITE_API_URL || '';
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const raw = envRaw || origin;
            const trimmed = raw.replace(/\/+$/, '').replace(/\/api$/, '');
            return /www\.humaniqai\.com\.br$/.test(trimmed) ? 'https://api.humaniqai.com.br' : trimmed;
          })();
          const checkResp = await fetch(`${apiBase}/api/auth/check`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include',
            mode: 'cors',
          });
          if (!checkResp.ok) {
            console.warn('⚠️ [EmpresaEstadoPsicossocial] Token inválido/expirado. Limpando sessão...');
            await authServiceNew.logout();
            throw new Error('Sessão expirada ou inválida. Faça login novamente.');
          }
        } catch (checkErr) {
          console.error('❌ [EmpresaEstadoPsicossocial] Falha ao validar token:', checkErr);
          throw checkErr instanceof Error ? checkErr : new Error('Falha ao validar token');
        }

        const apiBase2 = (() => {
          const envRaw = import.meta.env.VITE_API_URL || '';
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const raw = envRaw || origin;
          const trimmed = raw.replace(/\/+$/, '').replace(/\/api$/, '');
          return /www\.humaniqai\.com\.br$/.test(trimmed) ? 'https://api.humaniqai.com.br' : trimmed;
        })();
        const response = await fetch(`${apiBase2}/api/empresas/estado-psicossocial`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`Erro ao carregar análise: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ [EmpresaEstadoPsicossocial] Dados carregados:', data);
        setAnalise(data.analise);
      } catch (err) {
        console.error('❌ [EmpresaEstadoPsicossocial] Erro:', err);
        setError(err as Error);
        toast.error('Erro ao carregar análise psicossocial');
      } finally {
        setIsLoading(false);
      }
    };

    carregarAnalise();
  }, []);

  // Loading state removed for non-blocking rendering

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="border-2 shadow-2xl" data-testid="alert-error">
            <AlertCircle className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">Ops! Algo não saiu como esperado</AlertTitle>
            <AlertDescription className="mt-2">
              <p>Não conseguimos carregar a análise psicossocial neste momento.</p>
              <p className="mt-2 text-sm">Erro: {error.message}</p>
              <p className="mt-2 text-sm">Por favor, aguarde alguns instantes e tente novamente. Se o problema persistir, nossa equipe está pronta para ajudar.</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!analise && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto">
          <Alert className="border-2 shadow-2xl">
            <Info className="h-6 w-6" />
            <AlertTitle className="text-xl font-bold">Dados não disponíveis</AlertTitle>
            <AlertDescription className="mt-2">
              <p>A análise psicossocial ainda não possui dados suficientes.</p>
              <p className="mt-2 text-sm">Certifique-se de que há colaboradores com testes concluídos.</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const wellbeingInfo = getWellbeingMessage(analise?.indiceGeralBemEstar || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-600/10 via-transparent to-transparent animate-pulse"></div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto p-6 space-y-8">
        {/* HERO SECTION - IMPACTO EMOCIONAL IMEDIATO */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl -z-10"></div>

          <Card className="border-0 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <CardContent className="p-8 md:p-12">
              <div className="flex items-start justify-between gap-8 flex-wrap">
                <div className="flex-1 min-w-[300px] space-y-6">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                      <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                        <Heart className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black text-white" data-testid="text-page-title">
                          Estado Psicossocial
                        </h1>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-xl">
                          <Sparkles className="h-3 w-3 mr-1" />
                          IA Ativa
                        </Badge>
                      </div>
                      <p className="text-white/70 text-lg font-medium">
                        Inteligência que cuida de pessoas
                      </p>
                    </div>
                  </div>

                  {/* Emotional Connection Message */}
                  <div className="space-y-3">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-10 w-3/4 bg-white/10" />
                        <Skeleton className="h-20 w-full bg-white/10" />
                      </>
                    ) : (
                      <>
                        <h2 className={`text-3xl font-black bg-gradient-to-r ${wellbeingInfo.color} bg-clip-text text-transparent`}>
                          {wellbeingInfo.title}
                        </h2>
                        <p className="text-white/90 text-lg leading-relaxed">
                          {wellbeingInfo.message}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-xl px-4 py-2">
                      <Shield className="h-4 w-4 mr-2" />
                      NR1 Compliant
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 backdrop-blur-xl px-4 py-2">
                      <Lock className="h-4 w-4 mr-2" />
                      LGPD Protegido
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-xl px-4 py-2">
                      <Award className="h-4 w-4 mr-2" />
                      ISO 45003
                    </Badge>
                  </div>
                </div>

                {/* Risk Gauge - Energy Efficiency Style */}
                <div className="flex items-center justify-center">
                  {isLoading ? (
                    <Skeleton className="h-48 w-48 rounded-full bg-white/10" />
                  ) : (
                    <RiskGauge
                      value={analise?.indiceGeralBemEstar || 0}
                      totalTests={analise?.totalTestesRealizados || 0}
                      size="medium"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* INDICADORES VITAIS - Design Premium com Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-0 bg-slate-800/40 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl">
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
                    <Skeleton className="h-5 w-5 rounded-full bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-10 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-32 bg-white/10" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Colaboradores */}
              <Card className="group border-0 bg-slate-800/40 backdrop-blur-2xl hover:bg-slate-800/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 hover:scale-105" data-testid="card-colaboradores">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-xl border border-blue-500/30">
                      <Users className="h-6 w-6 text-blue-300" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-blue-300 uppercase tracking-wider">
                      Colaboradores
                    </div>
                    <AnimatedCounter value={analise?.totalColaboradores || 0} />
                    <div className="text-sm text-white/60">
                      Fazem parte desta jornada
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cobertura */}
              <Card className="group border-0 bg-slate-800/40 backdrop-blur-2xl hover:bg-slate-800/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl hover:shadow-emerald-500/20 hover:scale-105" data-testid="card-cobertura">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-xl border border-emerald-500/30">
                      <Eye className="h-6 w-6 text-emerald-300" />
                    </div>
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
                      Cobertura
                    </div>
                    <AnimatedCounter value={analise?.cobertura || 0} suffix="%" />
                    <Progress value={analise?.cobertura || 0} className="h-2 bg-white/10" />
                    <div className="text-sm text-white/60">
                      Participação ativa
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avaliações */}
              <Card className="group border-0 bg-slate-800/40 backdrop-blur-2xl hover:bg-slate-800/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 hover:scale-105" data-testid="card-avaliacoes">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-xl border border-purple-500/30">
                      <Star className="h-6 w-6 text-purple-300" />
                    </div>
                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-purple-300 uppercase tracking-wider">
                      Avaliações
                    </div>
                    <AnimatedCounter value={analise?.totalTestesRealizados || 0} />
                    <div className="text-sm text-white/60">
                      Insights coletados
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              <Card className="group border-0 bg-slate-800/40 backdrop-blur-2xl hover:bg-slate-800/60 transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl hover:shadow-orange-500/20 hover:scale-105" data-testid="card-alertas">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-xl border border-orange-500/30">
                      <Zap className="h-6 w-6 text-orange-300" />
                    </div>
                    {(analise?.alertasCriticos.length || 0) > 0 && (
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-orange-300 uppercase tracking-wider">
                      Pontos de Atenção
                    </div>
                    <AnimatedCounter value={analise?.alertasCriticos.length || 0} />
                    <div className="text-sm text-white/60">
                      {(analise?.alertasCriticos.length || 0) === 0
                        ? "Tudo sob controle!"
                        : "Requerem sua atenção"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL - Tabs Modernos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-2xl border-0 p-2 rounded-2xl shadow-2xl">
            <TabsTrigger
              value="ia"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              data-testid="tab-ia"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Análise IA</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
            <TabsTrigger
              value="nr1"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              data-testid="tab-nr1"
            >
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">NR1</span>
              <span className="sm:hidden">NR1</span>
            </TabsTrigger>
            <TabsTrigger
              value="dimensoes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              data-testid="tab-dimensoes"
            >
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dimensões</span>
              <span className="sm:hidden">Dim</span>
            </TabsTrigger>
            <TabsTrigger
              value="acoes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
              data-testid="tab-acoes"
            >
              <Target className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ações</span>
              <span className="sm:hidden">Ações</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: ANÁLISE POR IA - O Destaque Principal */}
          <TabsContent value="ia" className="space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-2xl bg-white/10" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64 bg-white/10" />
                  <Skeleton className="h-48 w-full rounded-2xl bg-white/10" />
                  <Skeleton className="h-48 w-full rounded-2xl bg-white/10" />
                </div>
              </div>
            ) : (
              <>
                {/* Privacy & Transparency Banner */}
                <Alert className="border-0 bg-gradient-to-r from-[#B85D45] to-[#C66B4E] backdrop-blur-2xl shadow-2xl rounded-2xl border-2 border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xl border border-white/20">
                      <Info className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <AlertTitle className="text-white font-bold text-lg mb-2">
                        Transparência Total: Como Funciona Nossa IA
                      </AlertTitle>
                      <AlertDescription className="text-white space-y-2 leading-relaxed">
                        <p><strong className="text-white font-extrabold">Metodologia:</strong> Análise de padrões em dados agregados e 100% anônimos dos seus colaboradores.</p>
                        <p><strong className="text-white font-extrabold">Frameworks Científicos:</strong> ISO 45003, OMS, Karasek-Siegrist, validados internacionalmente.</p>
                        <p><strong className="text-white font-extrabold">Sua Privacidade:</strong> Nenhum dado individual é exposto. LGPD Art. 20 garantido.</p>
                        <p><strong className="text-white font-extrabold">Próximo Passo:</strong> Valide com RH e Saúde Ocupacional para ação estratégica.</p>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>

                {/* AI-Generated Insights - Cards Premium */}
                {analise && analise.recomendacoes.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <Sparkles className="h-7 w-7 text-purple-400" />
                        Insights que Transformam
                      </h3>
                    </div>

                    <div className="grid gap-4">
                      {analise.recomendacoes.map((rec, index) => {
                        const isPriority = rec.prioridade === 'Alta';
                        return (
                          <Card
                            key={index}
                            className={`group border-0 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-500 ${isPriority
                              ? 'bg-gradient-to-r from-red-900/60 to-orange-900/60 hover:from-red-900/80 hover:to-orange-900/80 border-2 border-red-500/40'
                              : 'bg-slate-800/50 hover:bg-slate-800/70 border border-white/5'
                              }`}
                            data-testid={`recomendacao-${index}`}
                          >
                            <CardContent className="p-6">
                              <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                  <div className={`p-4 rounded-2xl backdrop-blur-xl ${isPriority ? 'bg-red-500/30 border border-red-500/50' : 'bg-purple-500/30 border border-purple-500/50'
                                    }`}>
                                    {isPriority ? (
                                      <Zap className="h-6 w-6 text-red-300" />
                                    ) : (
                                      <Star className="h-6 w-6 text-purple-300" />
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-[200px]">
                                      <div className="flex items-center gap-3 mb-2">
                                        <Badge className={isPriority
                                          ? "bg-red-500 text-white border-0"
                                          : "bg-orange-500 text-white border-0"
                                        }>
                                          {rec.prioridade === 'Alta' ? 'URGENTE' : 'IMPORTANTE'}
                                        </Badge>
                                        <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20 backdrop-blur-xl">
                                          {rec.categoria}
                                        </Badge>
                                      </div>
                                      <h4 className="text-xl font-bold text-white mb-2">
                                        {rec.titulo}
                                      </h4>
                                      <p className={`leading-relaxed ${isPriority ? 'text-red-50' : 'text-slate-200'}`}>
                                        {rec.descricao}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <Card className="border-0 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl">
                    <CardContent className="p-12 text-center">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="inline-block p-6 bg-purple-500/20 rounded-3xl backdrop-blur-xl">
                          Ⓛh-16 w-16 text-purple-300Ⓛ
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          IA Aprendendo Sobre Sua Organização
                        </h3>
                        <p className="text-white/70 text-lg">
                          Precisamos de mais dados para gerar insights personalizados.
                          Incentive seus colaboradores a participarem das avaliações.
                        </p>
                        <div className="pt-4">
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-xl">
                            Ver Testes Disponíveis
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Alertas Críticos */}
                {analise && analise.alertasCriticos.length > 0 && (
                  <Card className="border-0 bg-gradient-to-r from-red-900/50 to-rose-900/50 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden border border-red-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
                    <CardHeader className="relative">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/30 rounded-xl backdrop-blur-xl border border-red-500/50 animate-pulse">
                          <AlertCircle className="h-6 w-6 text-red-300" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-white text-2xl font-black">
                            Situações que Pedem Sua Coragem
                          </CardTitle>
                          <CardDescription className="text-white/70 text-base mt-1">
                            Liderar é agir quando mais importa. Você tem o poder de transformar estas situações.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      {analise.alertasCriticos.map((alerta, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 hover:bg-black/30 transition-all duration-300"
                          data-testid={`alerta-critico-${index}`}
                        >
                          <ChevronRight className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                          <p className="text-white/90 leading-relaxed flex-1">{alerta}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* TAB: NR1 */}
          <TabsContent value="nr1" className="space-y-6">
            <Card className="border-0 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-xl border border-blue-500/30">
                    <Shield className="h-6 w-6 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl font-black">
                      Fatores de Risco Psicossociais (NR1)
                    </CardTitle>
                    <CardDescription className="text-white/70 text-base mt-1">
                      Conformidade com NR1 - Vigente desde Maio 2025
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analise?.nr1Fatores.map((fator, index) => {
                  const nivel = fator.nivel.toLowerCase();
                  const isCritico = nivel.includes('crítico') || nivel.includes('alto');

                  return (
                    <div
                      key={index}
                      className="space-y-3 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all"
                      data-testid={`nr1-fator-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-lg">{fator.fator}</span>
                          <Badge className={isCritico
                            ? "bg-red-500 text-white border-0"
                            : "bg-emerald-500 text-white border-0"
                          }>
                            {fator.nivel}
                          </Badge>
                        </div>
                        <span className="text-white/70 font-bold text-lg">{fator.percentual}%</span>
                      </div>
                      <Progress
                        value={fator.percentual}
                        className={`h-3 ${isCritico ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}
                      />
                    </div>
                  );
                })}

                <Separator className="my-6 bg-white/20" />

                <Alert className="border-0 bg-blue-500/20 backdrop-blur-xl">
                  <Info className="h-5 w-5 text-blue-300" />
                  <AlertTitle className="text-white font-bold">Sobre a NR1 (Maio 2025)</AlertTitle>
                  <AlertDescription className="text-white/80 mt-2">
                    As empresas devem avaliar e gerenciar riscos como carga excessiva, falta de autonomia,
                    assédio e conflitos. Nossa análise identifica áreas críticas e propõe ações preventivas baseadas em ciência.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: DIMENSÕES */}
          <TabsContent value="dimensoes" className="space-y-6">
            <Card className="border-0 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-xl border border-emerald-500/30">
                    <Activity className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl font-black">
                      Dimensões Psicossociais
                    </CardTitle>
                    <CardDescription className="text-white/70 text-base mt-1">
                      Baseado em ISO 45003, OMS e Karasek-Siegrist
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analise && analise.dimensoes.length > 0 ? (
                  analise.dimensoes.map((dimensao, index) => (
                    <div
                      key={index}
                      className="space-y-3 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all"
                      data-testid={`dimensao-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-lg">
                            {(() => {
                              const nome = dimensao.nome;

                              // 1. Mapeamento Numérico
                              if (/^\d+$/.test(nome)) {
                                const mapNumerico: Record<string, string> = {
                                  "0": "Comunicação e Clareza",
                                  "1": "Liderança e Suporte",
                                  "2": "Relacionamento Interpessoal",
                                  "3": "Reconhecimento e Feedback",
                                  "4": "Condições de Trabalho",
                                  "5": "Equilíbrio Vida-Trabalho",
                                  "6": "Engajamento e Pertencimento",
                                  "7": "Bem-Estar Psicológico",
                                  "8": "Justiça Organizacional"
                                };
                                return mapNumerico[nome] || `Dimensão ${nome}`;
                              }

                              // 2. Dicionário de Correções (Map raw IDs/slugs to Title Case with Accents)
                              const mapTexto: Record<string, string> = {
                                // Termos simples
                                "lideranca": "Liderança",
                                "comunicacao": "Comunicação",
                                "relacionamento": "Relacionamento Interpessoal",
                                "reconhecimento": "Reconhecimento",
                                "desenvolvimento": "Desenvolvimento Profissional",
                                "condicoes": "Condições de Trabalho",
                                "equilibrio": "Equilíbrio Vida-Trabalho",
                                "engajamento": "Engajamento",
                                "bemestar": "Bem-Estar",
                                "bem-estar": "Bem-Estar",
                                "justica": "Justiça Organizacional",
                                "assedio": "Assédio",
                                "violencia": "Violência",
                                "estresse": "Estresse Ocupacional",
                                "burnout": "Burnout",
                                "resiliencia": "Resiliência",
                                "recompensas": "Recompensas",
                                "qvt": "Qualidade de Vida no Trabalho",
                                "hipercomprometimento": "Hipercomprometimento",
                                "pertencimento": "Pertencimento e Inclusão",

                                // Termos compostos (com correções de conectivos e acentos)
                                "prevencao mapeamento": "Prevenção e Mapeamento",
                                "monitoramento acompanhamento": "Monitoramento e Acompanhamento",
                                "acolhimento suporte": "Acolhimento e Suporte",
                                "cultura comunicacao": "Cultura e Comunicação",
                                "demandas trabalho": "Demandas do Trabalho",
                                "autonomia controle": "Autonomia e Controle",
                                "controle autonomia": "Controle e Autonomia",
                                "seguranca emprego": "Segurança no Emprego",
                                "conflito trabalho familia": "Conflito Trabalho-Família",
                                "seguranca psicologica": "Segurança Psicológica",
                                "comunicacao interna": "Comunicação Interna",
                                "justica organizacional": "Justiça Organizacional",
                                "demanda psicologica": "Demanda Psicológica",
                                "esforco exigido": "Esforço Exigido",
                                "ambiente fisico": "Ambiente Físico",
                                "recompensas recebidas": "Recompensas Recebidas",
                                "apoio social": "Apoio Social",
                                "cultura organizacional": "Cultura Organizacional",
                                "assedio violencia": "Assédio e Violência",
                                "controle trabalho": "Controle sobre o Trabalho",

                                // Variações com underscore (caso o backend envie assim)
                                "prevencao_mapeamento": "Prevenção e Mapeamento",
                                "monitoramento_acompanhamento": "Monitoramento e Acompanhamento",
                                "acolhimento_suporte": "Acolhimento e Suporte",
                                "cultura_comunicacao": "Cultura e Comunicação",
                                "demandas_trabalho": "Demandas do Trabalho",
                                "autonomia_controle": "Autonomia e Controle",
                                "seguranca_emprego": "Segurança no Emprego",
                                "conflito_trabalho_familia": "Conflito Trabalho-Família",
                                "seguranca_psicologica": "Segurança Psicológica",
                                "comunicacao_interna": "Comunicação Interna",
                                "justica_organizacional": "Justiça Organizacional",
                                "demanda_psicologica": "Demanda Psicológica",
                                "controle_autonomia": "Controle e Autonomia",
                                "esforco_exigido": "Esforço Exigido"
                              };

                              const chave = nome.toLowerCase().trim();

                              // Tentar match exato
                              if (mapTexto[chave]) return mapTexto[chave];

                              // Tentar match sem separadores
                              const chaveSemSep = chave.replace(/[_-]/g, "");
                              if (mapTexto[chaveSemSep]) return mapTexto[chaveSemSep];

                              // 3. Fallback: Remover _ e - e Capitalizar
                              // Corrige palavras comuns manualmente no fallback se necessário
                              return nome
                                .replace(/[_-]/g, ' ')
                                .replace(/\b(de|da|do|e|ou|com|por|em)\b/g, (match) => match.toLowerCase()) // Manter preposições minúsculas
                                .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalizar primeira letra de cada palavra
                            })()}
                          </span>
                          <Badge className="bg-white/20 text-white border-white/30">
                            {dimensao.nivel}
                          </Badge>
                        </div>
                        <span className="text-white/70 font-bold">
                          {dimensao.percentual}% ({dimensao.total})
                        </span>
                      </div>
                      <Progress value={dimensao.percentual} className="h-3" />
                    </div>
                  ))
                ) : (
                  <Alert className="border-0 bg-white/5 backdrop-blur-xl">
                    <Info className="h-5 w-5 text-white/70" />
                    <AlertTitle className="text-white">Dados Insuficientes</AlertTitle>
                    <AlertDescription className="text-white/70">
                      Incentive seus colaboradores a realizarem os testes para análise dimensional completa.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: PLANO DE AÇÃO */}
          <TabsContent value="acoes" className="space-y-6">
            {/* Hero Card - Jornada de Transformação */}
            <Card className="border-0 bg-gradient-to-br from-orange-600/30 to-pink-600/30 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden border-2 border-orange-500/40">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl shadow-xl">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-3xl font-black text-white">Jornada de Transformação</h2>
                    <p className="text-white/90 text-lg leading-relaxed">
                      Seu roteiro para construir um ambiente extraordinário
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* High Priority Actions - 7 Dias */}
            {analise && analise.recomendacoes.filter(r => r.prioridade === 'Alta').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-red-600/30 rounded-xl backdrop-blur-xl border-2 border-red-500/50 shadow-xl">
                    <Zap className="h-6 w-6 text-red-200 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-red-200 font-black text-2xl">Ação Imediata (Próximos 7 Dias)</h3>
                    <p className="text-red-200/70 text-sm">Intervenções urgentes para prevenir agravamento</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {analise.recomendacoes
                    .filter(r => r.prioridade === 'Alta')
                    .map((rec, index) => (
                      <Card
                        key={index}
                        className="border-0 bg-red-600/25 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border-2 border-red-500/40 hover:border-red-400/60 transition-all hover:scale-[1.02]"
                        data-testid={`acao-alta-${index}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-red-500/30 flex items-center justify-center border-2 border-red-400/50">
                                <CheckCircle className="h-6 w-6 text-red-200" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-red-50 font-bold text-lg leading-tight">{rec.titulo}</h4>
                                <Badge className="bg-red-500 text-white border-0 shadow-lg flex-shrink-0">
                                  Urgente
                                </Badge>
                              </div>
                              <p className="text-red-50/90 leading-relaxed">{rec.descricao}</p>

                              {rec.categoria && (
                                <div className="flex items-center gap-2 pt-2 border-t border-red-400/20">
                                  <Badge className="bg-red-500/30 text-red-100 border-red-400/40">
                                    {rec.categoria}
                                  </Badge>
                                  <span className="text-red-200/60 text-xs">• Conformidade NR1</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Medium Priority Actions - 30 Dias */}
            {analise && analise.recomendacoes.filter(r => r.prioridade === 'Média').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-orange-600/30 rounded-xl backdrop-blur-xl border-2 border-orange-500/50 shadow-xl">
                    <Clock className="h-6 w-6 text-orange-200" />
                  </div>
                  <div>
                    <h3 className="text-orange-200 font-black text-2xl">Próximos 30 Dias</h3>
                    <p className="text-orange-200/70 text-sm">Iniciativas estratégicas de médio prazo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {analise.recomendacoes
                    .filter(r => r.prioridade === 'Média')
                    .map((rec, index) => (
                      <Card
                        key={index}
                        className="border-0 bg-orange-600/25 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border-2 border-orange-500/40 hover:border-orange-400/60 transition-all hover:scale-[1.02]"
                        data-testid={`acao-media-${index}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 rounded-full bg-orange-500/30 flex items-center justify-center border-2 border-orange-400/50">
                                <CheckCircle className="h-6 w-6 text-orange-200" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="text-orange-50 font-bold text-lg leading-tight">{rec.titulo}</h4>
                                <Badge className="bg-orange-500 text-white border-0 shadow-lg flex-shrink-0">
                                  Importante
                                </Badge>
                              </div>
                              <p className="text-orange-50/90 leading-relaxed">{rec.descricao}</p>

                              {rec.categoria && (
                                <div className="flex items-center gap-2 pt-2 border-t border-orange-400/20">
                                  <Badge className="bg-orange-500/30 text-orange-100 border-orange-400/40">
                                    {rec.categoria}
                                  </Badge>
                                  <span className="text-orange-200/60 text-xs">• ISO 45003</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Best Practices - ISO 45003 */}
            <Card className="border-0 bg-blue-600/20 backdrop-blur-2xl shadow-xl rounded-2xl overflow-hidden border-2 border-blue-500/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/30 rounded-xl backdrop-blur-xl border-2 border-blue-500/50 shadow-xl">
                    <Star className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="text-blue-100 font-black text-2xl">Melhores Práticas ISO 45003</h3>
                    <p className="text-blue-200/70 text-sm">Padrões internacionais de saúde mental no trabalho</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    titulo: "Avaliações regulares (semestral ideal, anual mínimo)",
                    descricao: "Monitoramento contínuo permite identificar problemas precocemente e medir evolução"
                  },
                  {
                    titulo: "Canais confidenciais para relatos de problemas",
                    descricao: "Ambientes seguros incentivam colaboradores a compartilhar preocupações sem medo"
                  },
                  {
                    titulo: "Capacitação de líderes em saúde mental",
                    descricao: "Gestores preparados identificam sinais precoces e oferecem suporte adequado"
                  },
                  {
                    titulo: "Políticas claras de prevenção ao assédio",
                    descricao: "Diretrizes explícitas criam cultura de respeito e segurança psicológica"
                  },
                  {
                    titulo: "Flexibilidade para equilíbrio vida-trabalho",
                    descricao: "Autonomia e flexibilidade reduzem estresse e aumentam satisfação no trabalho"
                  }
                ].map((pratica, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-600/15 backdrop-blur-xl rounded-xl border border-blue-500/30 hover:bg-blue-600/20 transition-all"
                    data-testid={`pratica-${index}`}
                  >
                    <div className="flex gap-3">
                      <ChevronRight className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-blue-50 font-semibold">{pratica.titulo}</p>
                        <p className="text-blue-100/70 text-sm leading-relaxed">{pratica.descricao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Alert className="border-0 bg-purple-600/20 backdrop-blur-xl shadow-xl border-2 border-purple-500/40">
              <Info className="h-5 w-5 text-purple-300" />
              <AlertTitle className="text-purple-100 font-bold text-lg">Por que seguir este plano?</AlertTitle>
              <AlertDescription className="text-purple-100/80 mt-2 space-y-2">
                <p>
                  <strong className="text-purple-50">Reduz riscos legais:</strong> Conformidade com NR1 (Portaria MTP nº 6.730/2020) evita multas e processos trabalhistas.
                </p>
                <p>
                  <strong className="text-purple-50">Aumenta produtividade:</strong> Colaboradores saudáveis são 31% mais produtivos e 3x mais engajados.
                </p>
                <p>
                  <strong className="text-purple-50">Retém talentos:</strong> Empresas com boa saúde mental têm 50% menos turnover.
                </p>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Última Atualização */}
        {analise && (
          <div className="text-center">
            <p className="text-white/50 text-sm">
              Última atualização: {format(new Date(analise.ultimaAtualizacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
