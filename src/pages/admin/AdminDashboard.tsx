import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Users, Building2, ShoppingCart, Target,
  Percent, Activity, ArrowUpRight, ArrowDownRight, BarChart3,
  Calendar, CheckCircle, XCircle, AlertCircle, Zap, Award,
  Eye, MousePointer, ShoppingBag, CreditCard, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { apiService } from '@/services/apiService';

interface DashboardMetrics {
  financeiro: {
    mrr: number;
    arr: number;
    receitaMensal: number;
    receitaTotal: number;
    ticketMedio: number;
    crescimentoMRR: number;
    projecaoProximoMes: number;
    projecaoTrimestre: number;
  };
  empresas: {
    total: number;
    ativas: number;
    inativas: number;
    novasEsteMes: number;
    crescimentoMensal: number;
    churnRate: number;
  };
  colaboradores: {
    total: number;
    ativos: number;
    mediaPorEmpresa: number;
    crescimentoMensal: number;
  };
  conversao: {
    visitantesLanding: number;
    testesDemonstracao: number;
    checkoutsIniciados: number;
    comprasFinalizadas: number;
    taxaLandingParaDemo: number;
    taxaDemoParaCheckout: number;
    taxaCheckoutParaCompra: number;
    taxaConversaoGeral: number;
    funilDiario?: Array<{ data: string; visitantes: number; demos: number; checkouts: number; vendas: number }>;
  };
  planos: {
    distribuicao: Array<{ plano: string; quantidade: number; receita: number }>;
    essencial: number;
    profissional: number;
    enterprise: number;
  };
  tendencias: {
    receitaMensal: Array<{ mes: string; receita: number; empresas: number }>;
    crescimentoEmpresa: Array<{ mes: string; novas: number; canceladas: number }>;
  };
  kpis: {
    ltv: number;
    cac: number;
    ltvCacRatio: number;
    paybackPeriod: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [indicadoresAgregados, setIndicadoresAgregados] = useState<{
    empresas: { total: number };
    testes: { total: number; mediaPontuacao: number; mediaPorEmpresa: number };
    analise: {
      tendencia: Array<{ mes: string; total: number }>;
      distribuicaoTemporal: Array<{ periodo: string; valor: number }>;
      porCategoria: Array<{ categoria: string; total: number }>;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  // Carregar indicadores agregados (empresas com compras)
  useEffect(() => {
    const load = async () => {
      try {
        const dados = await apiService.obterIndicadoresEmpresasComCompras();
        setIndicadoresAgregados(dados as any);
      } catch (err) {
        console.warn('⚠️ Falha ao carregar indicadores agregados', err);
      }
    };
    load();
  }, []);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiService.obterDashboardAdmin();
      console.log('📊 Dashboard carregado:', data);
      setMetrics(data as DashboardMetrics);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      const msg = error?.data?.error || error?.message || 'Erro ao carregar dashboard executivo';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando dashboard executivo...</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const planosData = metrics.planos.distribuicao.map(p => ({
    name: p.plano,
    value: p.quantidade,
    receita: p.receita,
  }));
  const porCategoria = indicadoresAgregados?.analise?.porCategoria ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Sparkles className="w-8 h-8 mr-3 text-blue-600" />
              Dashboard Executivo
            </h1>
            <p className="text-gray-600 mt-1">Visão completa do negócio em tempo real</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Última atualização</p>
            <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* KPIs Principais - Linha 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* MRR */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="flex items-center space-x-1">
              {metrics.financeiro.crescimentoMRR >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-white" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-white" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(metrics.financeiro.crescimentoMRR)}%
              </span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">MRR (Receita Mensal Recorrente)</p>
          <p className="text-3xl font-bold">R$ {metrics.financeiro.mrr.toLocaleString('pt-BR')}</p>
          <p className="text-xs opacity-75 mt-2">ARR: R$ {metrics.financeiro.arr.toLocaleString('pt-BR')}</p>
        </div>

        {/* Empresas Ativas */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="flex items-center space-x-1">
              {metrics.empresas.crescimentoMensal >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-white" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-white" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(metrics.empresas.crescimentoMensal)}%
              </span>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Empresas Ativas</p>
          <p className="text-3xl font-bold">{metrics.empresas.ativas}</p>
          <p className="text-xs opacity-75 mt-2">
            {metrics.empresas.novasEsteMes} novas este mês
          </p>
        </div>

        {/* Taxa de Conversão Geral */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target className="w-8 h-8" />
            </div>
            <CheckCircle className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-sm opacity-90 mb-1">Taxa de Conversão Geral</p>
          <p className="text-3xl font-bold">{metrics.conversao.taxaConversaoGeral}%</p>
          <p className="text-xs opacity-75 mt-2">
            {metrics.conversao.comprasFinalizadas} compras de {metrics.conversao.visitantesLanding} visitas
          </p>
        </div>

        {/* Ticket Médio */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CreditCard className="w-8 h-8" />
            </div>
            <Award className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-sm opacity-90 mb-1">Ticket Médio</p>
          <p className="text-3xl font-bold">R$ {metrics.financeiro.ticketMedio.toLocaleString('pt-BR')}</p>
          <p className="text-xs opacity-75 mt-2">
            {metrics.colaboradores.mediaPorEmpresa.toFixed(1)} colab/empresa
          </p>
        </div>
      </div>

      {/* Funil de Conversão Moderno - DIÁRIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <MousePointer className="w-5 h-5 mr-2 text-purple-600" />
            Funil de Conversão (Diário - 30 dias)
          </div>
          <div className="flex space-x-2 text-sm">
            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div> Visitantes</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div> Demos</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div> Checkouts</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div> Vendas</div>
          </div>
        </h3>

        {/* Gráfico de Tendência Diária */}
        <div className="mb-8">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={metrics.conversao.funilDiario || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="data"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval={4}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="visitantes" name="Visitantes" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={2} />
              <Bar dataKey="demos" name="Demos" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="checkouts" name="Checkouts" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="vendas" name="Vendas" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Cards Resumo do Funil (Estilo Moderno) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-600 font-medium mb-1">Visitantes</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.conversao.visitantesLanding}</p>
          </div>
          <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
            <p className="text-sm text-green-600 font-medium mb-1">Testes Demo</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.conversao.testesDemonstracao}</p>
          </div>
          <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
            <p className="text-sm text-yellow-600 font-medium mb-1">Checkouts</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.conversao.checkoutsIniciados}</p>
          </div>
          <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
            <p className="text-sm text-red-600 font-medium mb-1">Vendas</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.conversao.comprasFinalizadas}</p>
          </div>
        </div>
      </div>

      {/* Receita Mensal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Receita Mensal (últimos 6 meses)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={metrics.tendencias.receitaMensal}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="receita" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReceita)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distribuição de Planos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Percent className="w-5 h-5 mr-2 text-emerald-600" />
          Distribuição de Planos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie data={planosData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                  {planosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3">
              {planosData.map((p, idx) => (
                <div key={p.name} className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: COLORS[idx % COLORS.length] }}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Empresas: {p.value}</p>
                    <p className="text-sm text-gray-600">Receita: R$ {metrics.planos.distribuicao[idx].receita.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {indicadoresAgregados && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
            Indicadores Agregados — Empresas com Compras
          </h3>

          {/* Cards resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-6 h-6" />
                <span className="text-xs opacity-80">Total de Empresas</span>
              </div>
              <p className="text-3xl font-bold">{indicadoresAgregados.empresas.total}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6" />
                <span className="text-xs opacity-80">Total de Testes</span>
              </div>
              <p className="text-3xl font-bold">{indicadoresAgregados.testes.total}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-6 h-6" />
                <span className="text-xs opacity-80">Média por Empresa</span>
              </div>
              <p className="text-3xl font-bold">{indicadoresAgregados.testes.mediaPorEmpresa}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6" />
                <span className="text-xs opacity-80">Pontuação Média</span>
              </div>
              <p className="text-3xl font-bold">{indicadoresAgregados.testes.mediaPontuacao}</p>
            </div>
          </div>

          {/* Tendência últimos 6 meses */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Testes Concluídos (últimos 6 meses)
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={indicadoresAgregados.analise.tendencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição temporal */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Distribuição por período do dia
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={indicadoresAgregados.analise.distribuicaoTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valor" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por categoria */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
              Distribuição por categoria
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie data={porCategoria} dataKey="total" nameKey="categoria" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                      {porCategoria.map((entry, index) => (
                        <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-3">
                  {porCategoria.map((c, idx) => (
                    <div key={c.categoria} className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: COLORS[idx % COLORS.length] }}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="font-medium">{c.categoria}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Testes: {c.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
