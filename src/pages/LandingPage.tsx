import { useState, useEffect, useRef } from 'react';
import {
  Shield, CheckCircle, TrendingUp, Users, FileCheck, Zap,
  Award, Clock, AlertTriangle, BarChart3, Sparkles, Target, Star,
  ChevronRight, Download, Play, ArrowRight, Check, X, GraduationCap,
  BookOpen, Scale, Brain, HeartPulse, UserCheck, FileBarChart, TrendingDown, QrCode,
  Mail, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { VinhedoFooter } from '@/components/VinhedoFooter';
import { SeoHead } from '@/components/seo/SeoHead';
import { organizationSchema, softwareApplicationSchema, websiteSchema } from '@/lib/seo/schemas';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('rh');
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();
  const certImgRef = useRef<HTMLImageElement>(null);
  const [stamp, setStamp] = useState<{ width: number; rotate: number; height: number; fontSize: number }>({ width: 0, rotate: 0, height: 0, fontSize: 0 });

  const navLinkClass = scrolled
    ? 'text-gray-800 hover:text-indigo-700 font-semibold'
    : 'text-gray-100 hover:text-indigo-300 drop-shadow-lg font-semibold';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const update = () => {
      const el = certImgRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      const diag = Math.sqrt(w * w + h * h);
      const angle = Math.atan2(h, w) * (180 / Math.PI);
      const height = Math.max(Math.round(h * 0.06), 24);
      const fontSize = Math.max(Math.round(height * 0.6), 14);
      const width = Math.max(Math.round(diag * 0.85), 100);
      setStamp({ width, rotate: -angle, height, fontSize });
    };
    update();
    const ro = new ResizeObserver(update);
    if (certImgRef.current) ro.observe(certImgRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const video = document.querySelector('video[data-testid="hero-video"]') as HTMLVideoElement;
    if (video) {
      console.log('🎬 Vídeo encontrado, tentando reproduzir...');
      console.log('📹 Vídeo selecionado: Pessoas olhando para computador - ID 3248994');

      const sources = video.querySelectorAll('source');
      console.log('📋 Sources disponíveis:', sources.length);
      sources.forEach((source, index) => {
        console.log(`🔗 Source ${index + 1}:`, (source as HTMLSourceElement).src);
      });

      video.play().catch(error => {
        console.log('🚫 Autoplay bloqueado, tentando reproduzir com interação:', error);
        document.addEventListener('click', () => {
          video.play().catch(e => console.log('❌ Erro ao reproduzir vídeo:', e));
        }, { once: true });
      });

      video.addEventListener('loadeddata', () => {
        console.log('✅ Vídeo carregado com sucesso!');
        console.log('📺 Vídeo atual:', video.currentSrc);
      });

      video.addEventListener('error', (e) => {
        console.log('❌ Erro ao carregar vídeo:', e);
        console.log('🔄 URL tentada:', video.currentSrc);
      });

      video.addEventListener('loadstart', () => {
        console.log('⏳ Iniciando carregamento do vídeo...');
      });
    }
  }, []);

  useEffect(() => {
    // RASTREAMENTO DE VISITA (REAL)
    const trackVisit = async () => {
      try {
        const visited = sessionStorage.getItem('humaniq_visited');
        if (!visited) {
          await fetch('/api/tracking/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origem: document.referrer || 'direct' })
          });
          sessionStorage.setItem('humaniq_visited', 'true');
          console.log('📡 Visita registrada com sucesso');
        }
      } catch (err) {
        console.warn('Falha ao registrar visita', err);
      }
    };
    trackVisit();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SeoHead
        title="HumaniQ AI | Software de Gestão de Riscos Psicossociais e NR-01"
        description="Plataforma completa para gestão de riscos psicossociais e atendimento à NR-01. Mapeamento, relatórios automáticos e conformidade legal garantida."
        canonicalUrl="/"
        ogImage="https://www.humaniqai.com.br/LOGO%20TRANSPARENTE.png"
        schema={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema, softwareApplicationSchema, websiteSchema]
        }}
      />
      {/* Header Fixo */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white/10 backdrop-blur-md border-b border-white/20'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex md:items-center md:flex-row flex-col gap-2">
            <div className="w-full md:w-auto flex items-center justify-between">
              <Logo size="md" showText={true} />
            </div>
            <nav className="hidden md:flex space-x-8 items-center md:ml-12">
              <button onClick={() => scrollToSection('solucao')} className={`${navLinkClass} transition-colors`}>
                Solução
              </button>
              <button onClick={() => scrollToSection('modulos')} className={`${navLinkClass} transition-colors`}>
                Módulos
              </button>
              <button onClick={() => scrollToSection('planos')} className={`${navLinkClass} transition-colors`}>
                Planos
              </button>
              <button onClick={() => scrollToSection('depoimentos')} className={`${navLinkClass} transition-colors`}>
                Casos de Sucesso
              </button>
              <button
                onClick={() => {
                  try {
                    window.dispatchEvent(new CustomEvent('chatbot:open'));
                  } catch (e) {
                    console.warn('Falha ao disparar evento chatbot:open', e);
                  }
                }}
                className={`${navLinkClass} transition-colors`}
                data-testid="button-chatbot-header"
                title="Abrir Chatbot"
              >
                Chatbot
              </button>
              <Button
                onClick={() => navigate('/quick-check')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="button-diagnostico-header"
              >
                Diagnóstico Gratuito
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                data-testid="button-login"
              >
                Entrar
              </Button>
            </nav>
            <nav className="flex md:hidden w-full">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => scrollToSection('solucao')} className={`${navLinkClass} transition-colors text-xs`}>
                  Solução
                </button>
                <button onClick={() => scrollToSection('modulos')} className={`${navLinkClass} transition-colors text-xs`}>
                  Módulos
                </button>
                <button onClick={() => scrollToSection('planos')} className={`${navLinkClass} transition-colors text-xs`}>
                  Planos
                </button>
                <button onClick={() => scrollToSection('depoimentos')} className={`${navLinkClass} transition-colors text-xs`}>
                  Casos de Sucesso
                </button>
                <button
                  onClick={() => {
                    try {
                      window.dispatchEvent(new CustomEvent('chatbot:open'));
                    } catch (e) {
                      console.warn('Falha ao disparar evento chatbot:open', e);
                    }
                  }}
                  className={`${navLinkClass} transition-colors text-xs`}
                  data-testid="button-chatbot-header"
                  title="Abrir Chatbot"
                >
                  Chatbot
                </button>
                <Button
                  onClick={() => navigate('/quick-check')}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs px-3 py-1"
                  data-testid="button-diagnostico-header"
                >
                  Diagnóstico Gratuito
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-xs px-3 py-1"
                  data-testid="button-login"
                >
                  Entrar
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* SEÇÃO 1: HERO */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            data-testid="hero-video"
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            crossOrigin="anonymous"
            aria-hidden="true"
            style={{ minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto' }}
          >
            <source src="https://videos.pexels.com/video-files/3248994/3248994-hd_1920_1080_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/7792332/7792332-hd_1920_1080_25fps.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/3184365/3184365-hd_1920_1080_30fps.mp4" type="video/mp4" />
            <source src="/videos/office-computer-hd.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos HTML5.
          </video>
        </div>
        {/* Overlay inteligente - gradiente sutil que cria contraste apenas onde necessário */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/5 via-transparent to-purple-900/5 z-10" />
        {/* Reforço de contraste específico para área de texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent z-10" />
        <div className="max-w-7xl mx-auto relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow-md relative z-30" data-testid="badge-prazo">
              ⚠️ URGENTE: Prazo NR-01 - Fiscalização ativa a partir de 25/05/2026
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              Gestão de Riscos Psicossociais e Compliance NR-01 com Inteligência Artificial
              <br />
              <span className="text-yellow-400">Tudo em um único plano por R$ 35 por colaborador/mês.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-2xl text-white mb-8 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              Elimine planilhas, reduza riscos legais e tome decisões estratégicas com dados reais,
              inteligência artificial e total conformidade normativa.
            </p>

            <div className="bg-white border-l-4 border-red-500 p-6 mb-8 rounded-lg shadow-lg relative z-30" data-testid="card-estatistica">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Dado alarmante que exige sua atenção
                  </p>
                  <p className="text-gray-800">
                    <strong className="text-xl text-red-600">472 mil afastamentos</strong> por transtornos mentais foram registrados no Brasil em 2024 —
                    um aumento de <strong className="text-red-700">68% em relação a 2023</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                <Button
                  size="lg"
                  onClick={() => scrollToSection('diagnostico')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-lg hover:shadow-xl transition-all text-gray-900 font-bold relative z-30"
                  data-testid="button-diagnostico-hero"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Fazer Teste Gratuito
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('demo')}
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-2 border-indigo-400 text-indigo-700 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 font-semibold transition-all bg-white shadow-lg hover:shadow-xl group relative z-30"
                  data-testid="button-demo"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Solicitar Demonstração
                </Button>
              </div>
              <p className="mt-4 text-sm sm:text-base text-gray-300 font-medium tracking-wide shadow-black drop-shadow-md">
                Sem contrato de fidelidade | Sem cartão de crédito | Implementação imediata
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: O PROBLEMA (DOR) */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              O custo invisível que está <span className="text-red-600">devorando sua empresa</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto font-medium">
              Enquanto você lê esta página, colaboradores da sua organização podem estar enfrentando:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
            <Card className="border-2 border-red-100 hover:border-red-300 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start mb-4">
                  <div className="bg-red-100 p-3 rounded-lg mr-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3 text-red-700">🎯 Riscos que Você NÃO Vê (Mas Estão Lá)</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Sobrecarga de trabalho e prazos irreais
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Assédio moral e conflitos não resolvidos
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Metas abusivas sem suporte adequado
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Jornadas excessivas sem previsibilidade
                      </li>
                      <li className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        Falta de apoio em momentos críticos
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 hover:border-orange-300 transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start mb-4">
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-3 text-orange-700">💰 Impacto Financeiro REAL</h3>
                    <ul className="space-y-3 text-gray-800">
                      <li className="flex items-start">
                        <span className="text-orange-600 font-black text-lg bg-orange-100 px-2 py-1 rounded">R$ 12-20k</span>
                        <span className="ml-2">por colaborador afastado</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 font-black text-lg bg-orange-100 px-2 py-1 rounded">20-50%</span>
                        <span className="ml-2">do salário anual por turnover</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-orange-600 font-black text-lg bg-orange-100 px-2 py-1 rounded">até 30%</span>
                        <span className="ml-2">de perda de produtividade</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 font-black text-lg bg-red-100 px-2 py-1 rounded">+R$ 100k</span>
                        <span className="ml-2">em indenizações por caso</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 font-black text-lg bg-red-100 px-2 py-1 rounded">+134%</span>
                        <span className="ml-2">em afastamentos em 2 anos</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white rounded-2xl p-6 md:p-8 text-center shadow-2xl border-2 border-indigo-400">
            <p className="text-3xl font-bold mb-3 text-yellow-300">
              🇧🇷 O Brasil está entre os países MAIS estressados do mundo
            </p>
            <p className="text-base sm:text-lg text-indigo-200 font-semibold">
              <span className="text-2xl sm:text-3xl md:text-4xl text-yellow-400 font-black">54%</span> da população reporta alta preocupação com saúde mental
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: MUDANÇA REGULATÓRIA (URGÊNCIA) */}
      <section id="urgencia" className="py-12 md:py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 text-lg font-bold shadow-xl" data-testid="badge-nr01">
              🚨 NOVA EXIGÊNCIA NR-01 - MULTAS DE ATÉ R$ 6.708
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              O que mudou na NR-01 — e por que sua empresa precisa agir <span className="text-red-600 font-black">AGORA</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto font-medium">
              A partir de <span className="text-red-600 font-bold">25 de maio de 2026</span>, empresas que não estiverem em conformidade enfrentarão <span className="text-red-600 font-bold">multas diárias</span> e <span className="text-red-600 font-bold">ações trabalhistas coletivas</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-200">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">✅ A NR-01 agora exige que você:</h3>
                <ul className="space-y-4">
                  {[
                    'Identifique os fatores de risco psicossociais',
                    'Avalie a intensidade e frequência desses riscos',
                    'Mensure o impacto na saúde dos colaboradores',
                    'Controle com planos de ação documentados',
                    'Monitore continuamente a evolução'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start bg-green-50 p-3 rounded-lg border-l-4 border-green-500" data-testid={`requirement-${index}`}>
                      <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800 text-lg font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 shadow-xl mb-6">
                <h3 className="text-2xl font-bold mb-6">Linha do Tempo Crítica</h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-white/30 pl-6">
                    <p className="font-semibold text-lg">Hoje</p>
                    <p className="text-red-100">Fase educativa — momento ideal para implementar</p>
                  </div>
                  <div className="border-l-4 border-yellow-300 pl-6">
                    <p className="font-semibold text-lg">Até 25/05/2026</p>
                    <p className="text-red-100">Período de adaptação — construa evidências</p>
                  </div>
                  <div className="border-l-4 border-red-300 pl-6">
                    <p className="font-semibold text-lg">Após 26/05/2026</p>
                    <p className="text-red-100 font-bold">Fiscalização ativa + Multas de R$ 1.799 a R$ 6.708</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg border-2 border-red-200">
                <h4 className="font-bold text-xl mb-4 text-red-800">⚠️ Consequências para quem não cumprir:</h4>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-start bg-red-100 p-3 rounded-lg border-l-4 border-red-500">
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-red-700 font-bold text-lg">Multas entre R$ 1.799,39 e R$ 6.708,08</strong>
                      <p className="text-sm text-red-600">por dia de descumprimento</p>
                    </div>
                  </li>
                  <li className="flex items-start bg-orange-100 p-3 rounded-lg border-l-4 border-orange-500">
                    <AlertTriangle className="h-6 w-6 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-orange-700 font-bold text-lg">Notificações via eSocial (automático)</strong>
                      <p className="text-sm text-orange-600">sem aviso prévio</p>
                    </div>
                  </li>
                  <li className="flex items-start bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-yellow-700 font-bold text-lg">Ações trabalhistas com dano moral coletivo</strong>
                      <p className="text-sm text-yellow-600">até R$ 100 mil por colaborador</p>
                    </div>
                  </li>
                  <li className="flex items-start bg-purple-100 p-3 rounded-lg border-l-4 border-purple-500">
                    <AlertTriangle className="h-6 w-6 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-purple-700 font-bold text-lg">Possibilidade de Ação Civil Pública (ACP)</strong>
                      <p className="text-sm text-purple-600">multas milionárias e danos reputacionais</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-red-600 via-orange-500 to-red-500 text-white rounded-2xl p-6 md:p-8 text-center shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform">
            <p className="text-lg sm:text-xl md:text-3xl font-bold mb-4">
              🚨 Empresas que começarem apenas em maio de 2026 estarão <strong className="text-yellow-300 bg-red-800 px-2 py-1 rounded">12 MESES ATRASADAS</strong> na construção de evidências
            </p>
            <p className="text-base sm:text-lg text-orange-100 font-medium">
              Auditores avaliarão o <strong className="text-white">histórico completo de ações</strong>, não apenas a situação presente.
              Com a <strong className="text-yellow-300">HumaniQ AI</strong>, você constrói esse histórico <strong className="text-white">automaticamente desde o primeiro dia</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: SOLUÇÃO COMPLETA */}
      <section id="solucao" className="py-12 md:py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 text-gray-900 px-8 py-3 text-lg font-bold shadow-2xl animate-bounce" data-testid="badge-solucao">
              🎯 SOLUÇÃO 360° COMPLETA - NR-01
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              HumaniQ AI: A Única Plataforma Completa para Gestão de Riscos Psicossociais
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-indigo-200 max-w-5xl mx-auto font-medium">
              A <span className="text-yellow-300 font-bold">única solução integrada</span> que entrega <Link to="/nr01" className="text-white font-bold hover:text-yellow-300 hover:underline transition-colors">tudo o que a NR-01 exige</Link> — do mapeamento online à capacitação de lideranças —
              em um sistema <span className="text-emerald-300 font-bold">totalmente automatizado e auditável</span>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 transform hover:scale-105 transition-transform">
            <p className="text-center text-2xl font-semibold mb-2 text-indigo-200">
              Não é apenas software.
            </p>
            <p className="text-center text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 bg-clip-text animate-pulse">
              É TODO O ECOSISTEMA DE CONFORMIDADE PSICOSSOCIAL
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: MÓDULOS DA PLATAFORMA */}
      <section id="modulos" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              9 Módulos Integrados. Uma Solução Completa.
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para estar 100% em conformidade com a NR-01
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Target,
                titulo: 'Mapeamento Online Automatizado',
                descricao: 'Avaliação digital de riscos com alertas protegidos por sigilo. 100% online, resultados em tempo real.',
                beneficio: 'Elimina planilhas manuais e processos lentos'
              },
              {
                icon: Shield,
                titulo: 'Avaliação Individual com Sigilo',
                descricao: 'Testes psicométricos validados com proteção LGPD. Dados individuais nunca expostos.',
                beneficio: 'Identificação precoce com ética e legalidade'
              },
              {
                icon: BarChart3,
                titulo: 'Dashboard de Saúde Psicossocial',
                descricao: 'Score de maturidade, mapa de calor por setor, comparação com benchmarks setoriais.',
                beneficio: 'Diretoria visualiza tudo em 30 segundos'
              },
              {
                icon: FileCheck,
                titulo: 'Relatórios Automáticos',
                descricao: 'Relatórios gerenciais, para auditoria e PGR específico NR-01. Exportação em PDF profissional.',
                beneficio: 'Entregue ao auditor exatamente o que ele precisa'
              },
              {
                icon: Award,
                titulo: 'Relatório PGR Específico NR-01',
                descricao: 'Documento técnico formatado conforme MTE, alinhado com ISO 45003, seções obrigatórias incluídas.',
                beneficio: 'Seu PGR fica completo e em conformidade'
              },
              {
                icon: Sparkles,
                titulo: 'Propostas de Ação Inteligentes',
                descricao: 'IA analisa dados e sugere intervenções personalizadas com responsáveis e prazos definidos.',
                beneficio: 'Do diagnóstico à ação sem consultoria externa'
              },
              {
                icon: TrendingUp,
                titulo: 'Melhoria Contínua',
                descricao: 'Sistema PDCA, sugestões de políticas internas, benchmarks e alertas proativos.',
                beneficio: 'A plataforma orienta evolução constante'
              },
              {
                icon: Users,
                titulo: 'Treinamento EAD para Lideranças',
                descricao: 'Curso completo sobre gestão de riscos psicossociais com certificação digital.',
                beneficio: 'Líderes capacitados = ambientes saudáveis'
              },
              {
                icon: Clock,
                titulo: 'Histórico Auditável Completo',
                descricao: 'Registro de todas as ações, quem acessou, quando, logs completos.',
                beneficio: 'Proteção jurídica total. Você prova tudo'
              }
            ].map((modulo, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-gray-100 hover:border-indigo-300" data-testid={`card-modulo-${index}`}>
                <CardContent className="pt-6">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <modulo.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{modulo.titulo}</h3>
                  <p className="text-gray-600 mb-4">{modulo.descricao}</p>
                  <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-sm font-semibold text-indigo-900">
                      <Sparkles className="inline h-4 w-4 mr-1" />
                      {modulo.beneficio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6.5: TRILHA DE CAPACITAÇÃO NR-01 COM CERTIFICAÇÃO PROFISSIONAL */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] -z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Cabeçalho com Âncora e Urgência */}
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 text-base font-bold animate-pulse" data-testid="badge-capacitacao">
              🎓 EXCLUSIVO: Trilha Completa NR-01 + Certificação Digital
            </Badge>

            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Capacite Suas Lideranças com a{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Única Trilha Certificada
              </span>{' '}
              para Gestão de Riscos Psicossociais
            </h2>

            <p className="text-base sm:text-lg md:text-2xl text-indigo-200 max-w-4xl mx-auto mb-8">
              <strong className="text-yellow-300">8 cursos profissionais</strong> baseados nas exigências da NR-01,
              com <strong className="text-yellow-300">certificação digital reconhecida</strong> que comprova a capacitação
              de suas lideranças perante auditores do MTE e processos trabalhistas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">1.247+ Líderes Certificados</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">Certificado Aceito em Auditorias MTE</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold">100% Online e Auditável</span>
              </div>
            </div>

            <div className="bg-amber-100 border-l-4 border-amber-500 text-gray-900 p-4 rounded-lg max-w-3xl mx-auto mb-8">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm font-semibold">
                  <span className="text-amber-600">ESCASSEZ:</span> Turmas limitadas a 50 empresas por trimestre.
                  Empresas que começarem após maio/2026 não terão tempo de construir histórico completo de capacitação.
                </p>
              </div>
            </div>
          </div>

          {/* Grid dos 8 Cursos Profissionais */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">
              Conheça os 8 Cursos da Trilha NR-01
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: BookOpen,
                  titulo: 'Fundamentos da NR-01',
                  duracao: '6h',
                  nivel: 'Essencial',
                  topicos: ['Histórico e Contexto', 'Exigências Legais', 'Responsabilidades'],
                  cor: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Scale,
                  titulo: 'Identificação de Riscos',
                  duracao: '8h',
                  nivel: 'Fundamental',
                  topicos: ['Mapeamento de Fatores', 'Instrumentos Validados', 'Análise Setorial'],
                  cor: 'from-purple-500 to-pink-500'
                },
                {
                  icon: Brain,
                  titulo: 'Avaliação Psicossocial',
                  duracao: '10h',
                  nivel: 'Avançado',
                  topicos: ['Testes Validados', 'Interpretação de Dados', 'Relatórios Técnicos'],
                  cor: 'from-indigo-500 to-purple-500'
                },
                {
                  icon: Shield,
                  titulo: 'Gestão de Riscos PGR',
                  duracao: '12h',
                  nivel: 'Estratégico',
                  topicos: ['PGR Psicossocial', 'ISO 45003', 'GRO Integrado'],
                  cor: 'from-green-500 to-emerald-500'
                },
                {
                  icon: HeartPulse,
                  titulo: 'Prevenção de Burnout',
                  duracao: '8h',
                  nivel: 'Especializado',
                  topicos: ['Sinais Precoces', 'Intervenções Eficazes', 'Apoio Psicológico'],
                  cor: 'from-red-500 to-orange-500'
                },
                {
                  icon: UserCheck,
                  titulo: 'Liderança Saudável',
                  duracao: '10h',
                  nivel: 'Liderança',
                  topicos: ['Comunicação Não-Violenta', 'Gestão de Conflitos', 'Cultura Positiva'],
                  cor: 'from-yellow-500 to-amber-500'
                },
                {
                  icon: FileBarChart,
                  titulo: 'Monitoramento Contínuo',
                  duracao: '6h',
                  nivel: 'Operacional',
                  topicos: ['Indicadores-Chave', 'Dashboards', 'Tomada de Decisão'],
                  cor: 'from-teal-500 to-cyan-500'
                },
                {
                  icon: TrendingDown,
                  titulo: 'Intervenção e Melhoria',
                  duracao: '10h',
                  nivel: 'Prático',
                  topicos: ['Planos de Ação', 'PDCA Psicossocial', 'Evidências para Auditoria'],
                  cor: 'from-violet-500 to-purple-500'
                }
              ].map((curso, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 hover:bg-white/15 transition-all hover:-translate-y-2 group" data-testid={`card-curso-${index}`}>
                  <CardContent className="pt-6 pb-6">
                    <div className={`bg-gradient-to-br ${curso.cor} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <curso.icon className="h-7 w-7 text-white" />
                    </div>

                    <Badge className="mb-3 bg-yellow-400 text-gray-900 text-xs font-bold">
                      {curso.nivel}
                    </Badge>

                    <h4 className="text-lg font-bold mb-2 text-white group-hover:text-yellow-300 transition-colors">
                      {curso.titulo}
                    </h4>

                    <div className="flex items-center gap-2 mb-3 text-sm text-indigo-200">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{curso.duracao} de conteúdo</span>
                    </div>

                    <ul className="space-y-1 text-sm text-gray-300">
                      {curso.topicos.map((topico, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{topico}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>


          </div>



          {/* Seção de Certificação Digital */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20">
            <div className="text-center mb-10 md:mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-green-400 to-emerald-400 text-gray-900 px-4 py-2 text-sm font-bold" data-testid="badge-certificacao">
                ✅ CERTIFICAÇÃO DIGITAL PROFISSIONAL
              </Badge>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Certificados Reconhecidos e Auditáveis
              </h3>
              <p className="text-base sm:text-lg text-indigo-200 max-w-3xl mx-auto">
                Cada curso concluído gera um <strong className="text-white">certificado digital profissional</strong> com
                validade jurídica, aceito em auditorias do MTE e processos trabalhistas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-[2px] rounded-3xl shadow-2xl mb-12 flex justify-center">
              <div className="bg-white rounded-[28px] p-0">
                <div
                  className="relative inline-block bg-white rounded-2xl border border-gray-200 mx-auto group cursor-zoom-in overflow-hidden"
                  onClick={() => window.open('/Captura%20de%20tela%202025-11-18%20102806.png', '_blank')}
                  role="button"
                >
                  <img
                    src="/Captura%20de%20tela%202025-11-18%20102806.png"
                    alt="Modelo de Certificado HumaniQ AI"
                    className="block h-auto w-auto max-h-[80vh] max-w-[92vw] transition-transform duration-300 ease-out group-hover:scale-[1.01]"
                    loading="lazy"
                    ref={certImgRef}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ width: `${stamp.width}px`, transform: `translate(-50%,-50%) rotate(${stamp.rotate}deg)` }}
                  >
                    <div className="flex items-center justify-center rounded-md bg-gradient-to-r from-amber-200/50 via-amber-300/40 to-amber-200/50 ring-1 ring-amber-400/60 shadow-[0_8px_32px_rgba(0,0,0,0.18)]" style={{ height: `${stamp.height}px` }}>
                      <span className="text-amber-900 font-extrabold tracking-[0.35em]" style={{ fontSize: `${stamp.fontSize}px` }}>MODELO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: QrCode,
                  titulo: 'QR Code de Autenticação',
                  descricao: 'Cada certificado possui QR Code único que permite verificação instantânea da autenticidade em segundos.',
                  destaque: '100% Verificável'
                },
                {
                  icon: Shield,
                  titulo: 'Assinatura Digital com Timestamp',
                  descricao: 'Certificado possui assinatura digital criptografada com registro de data e hora, garantindo validade jurídica.',
                  destaque: 'Validade Jurídica'
                },
                {
                  icon: Download,
                  titulo: 'Download em PDF Profissional',
                  descricao: 'Certificado em PDF de alta qualidade, pronto para impressão ou envio digital para auditores e processos.',
                  destaque: 'Formato Universal'
                }
              ].map((item, index) => (
                <div key={index} className="text-center" data-testid={`certificacao-${index}`}>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-white">{item.titulo}</h4>
                  <p className="text-gray-300 mb-3">{item.descricao}</p>
                  <Badge className="bg-green-400 text-gray-900 font-semibold">
                    {item.destaque}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-center">
              <p className="text-lg font-semibold mb-2">
                <Star className="inline h-5 w-5 text-yellow-300 mr-2" />
                Aprovação de Auditores MTE
              </p>
              <p className="text-2xl font-bold text-white">
                97% dos auditores validam nossos certificados sem ressalvas
              </p>
              <p className="text-sm text-green-100 mt-2">
                Baseado em 1.247 certificados apresentados em auditorias fiscais entre 2024-2025
              </p>
            </div>
          </div>

          {/* Âncoragem de Valor */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 max-w-3xl mx-auto">
              <p className="text-xl mb-2 text-indigo-200">
                <span className="line-through">Valor de Mercado: R$ 12.800</span>
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-300 mb-4">
                INCLUSO em todos os planos HumaniQ AI
              </p>
              <p className="text-lg text-gray-300">
                Economize <strong className="text-white">R$ 12.800</strong> em capacitação externa +
                elimine custos de consultoria para elaboração de PGR Psicossocial
              </p>
            </div>
          </div>

        </div>
      </section >

      {/* SEÇÃO 7: BENEFÍCIOS POR PÚBLICO */}
      < section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Benefícios para Cada Área da Sua Empresa
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Uma solução que atende todos os stakeholders
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-2 shadow-lg inline-flex gap-2">
              {[
                { id: 'rh', label: 'RH' },
                { id: 'juridico', label: 'Jurídico' },
                { id: 'diretoria', label: 'Diretoria' },
                { id: 'compliance', label: 'Compliance' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            {activeTab === 'rh' && (
              <div data-testid="content-rh">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para o RH</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'Diagnóstico preciso do clima organizacional',
                    'Identificação precoce de áreas críticas',
                    'Planos de ação inteligentes e personalizados',
                    'Acompanhamento da evolução em tempo real',
                    'Redução de turnover e absenteísmo'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'juridico' && (
              <div data-testid="content-juridico">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para o Jurídico</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'Evidências documentadas para defesa em processos',
                    'Relatórios probatórios com rastreabilidade completa',
                    'Conformidade com NR-01 e ISO 45003',
                    'Histórico de ações preventivas e corretivas',
                    'Proteção contra dano moral coletivo'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'diretoria' && (
              <div data-testid="content-diretoria">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para a Diretoria</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'ROI claro: economia em afastamentos e turnover',
                    'Reputação fortalecida (ESG e Employer Branding)',
                    'Dashboard executivo com indicadores estratégicos',
                    'Redução de passivos trabalhistas',
                    'Score de maturidade organizacional'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div data-testid="content-compliance">
                <h3 className="text-2xl font-bold mb-6 text-indigo-600">Para Compliance e SESMT</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    'Integração automática com PGR e GRO',
                    'Relatórios prontos para fiscalização do MTE',
                    'Atendimento às orientações técnicas oficiais',
                    'Logs de auditoria completos',
                    'Capacitação contínua de lideranças'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section >

      {/* SEÇÃO 10: PROVA SOCIAL */}
      < section id="depoimentos" className="py-12 md:py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Empresas que já transformaram sua gestão de riscos
            </h2>
            <div className="flex justify-center items-center gap-2 text-yellow-500">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-6 w-6 fill-current" />)}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                depoimento: "A HumaniQ AI entregou tudo: o mapeamento, os relatórios para o PGR e ainda capacitou nossas lideranças. Reduzimos 23% dos riscos críticos em 90 dias.",
                autor: "Gestora de RH",
                empresa: "Indústria Alimentícia",
                colaboradores: "450 colaboradores"
              },
              {
                depoimento: "Quando o auditor pediu evidências sobre riscos psicossociais, abri a plataforma e exportei o relatório PGR em 2 minutos. Ele ficou impressionado com o nível de detalhamento.",
                autor: "Coordenador SESMT",
                empresa: "Logística",
                colaboradores: "1.200 colaboradores"
              },
              {
                depoimento: "O treinamento EAD para líderes foi fundamental. Eles agora sabem identificar sinais de sobrecarga e agir preventivamente. Nosso clima melhorou 40% em 6 meses.",
                autor: "Diretor de Pessoas",
                empresa: "Varejo",
                colaboradores: "800 colaboradores"
              }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all" data-testid={`card-depoimento-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-current text-yellow-500" />)}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{item.depoimento}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{item.autor}</p>
                    <p className="text-sm text-gray-600">{item.empresa} | {item.colaboradores}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section >

      {/* SEÇÃO 11: ROI E ECONOMIA */}
      < section id="preco" className="py-12 md:py-20 bg-gradient-to-br from-green-50 to-emerald-50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Quanto sua empresa pode <span className="text-green-600">economizar</span> com a HumaniQ AI?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-red-600 mb-6">Cenário Atual (sem gestão completa)</h3>
              <div className="space-y-4">
                {[
                  { item: '5 afastamentos/ano × R$ 15.000', valor: 'R$ 75.000' },
                  { item: '3 turnover/ano × R$ 25.000', valor: 'R$ 75.000' },
                  { item: '1 ação trabalhista × R$ 120.000', valor: 'R$ 120.000' },
                  { item: 'Consultoria para PGR × R$ 30.000', valor: 'R$ 30.000' },
                  { item: 'Treinamentos externos × R$ 20.000', valor: 'R$ 20.000' },
                  { item: 'Perda de produtividade estimada', valor: 'R$ 80.000' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-700">{item.item}</span>
                    <span className="font-bold text-red-600">{item.valor}</span>
                  </div>
                ))}
                <div className="bg-red-100 p-4 rounded-lg mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total de custos evitáveis:</span>
                    <span className="text-3xl font-bold text-red-600">R$ 400.000/ano</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Com HumaniQ AI (Plataforma Completa)</h3>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <p className="text-lg mb-2">Investimento Anual</p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold">R$ 29.900</p>
                  <p className="text-green-200 mt-2">Tudo incluído. Sem custos extras.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <p className="text-lg mb-2">Economia Potencial</p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold">R$ 370.000/ano</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 p-6 rounded-xl">
                  <p className="text-lg mb-2 font-semibold">Retorno sobre Investimento</p>
                  <p className="text-4xl sm:text-5xl md:text-6xl font-bold">1.238%</p>
                  <p className="text-gray-800 mt-2 font-medium">Para cada R$ 1 investido, você economiza R$ 12,38</p>
                </div>

                <div className="text-center pt-4">
                  <Button
                    size="lg"
                    onClick={() => scrollToSection('diagnostico')}
                    className="bg-white text-green-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-xl"
                    data-testid="button-diagnostico-roi"
                  >
                    Comece Seu Diagnóstico Gratuito
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* SEÇÃO 12: PLANO ÚNICO */}
      < section id="planos" className="py-12 md:py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 text-lg font-bold shadow-xl">
              PLANO ÚNICO — HUMANIQ AI
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              R$ 35 por colaborador / mês
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto mb-4">
              A plataforma completa para <Link to="/riscos-psicossociais" className="text-indigo-600 hover:underline font-medium">gestão de riscos psicossociais</Link>, compliance com a NR-01 e inteligência organizacional,
              desenvolvida para empresas que não podem operar no escuro.
            </p>
            <p className="text-xl font-bold text-indigo-600 max-w-3xl mx-auto">
              Tudo incluso. Sem módulos bloqueados. Sem surpresas.
            </p>
          </div>

          {/* Card Único Centralizado */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-4 border-indigo-500 relative hover:border-indigo-600 transition-all hover:shadow-2xl" data-testid="card-plano-unico">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 text-sm font-bold shadow-lg">
                  ✅ TUDO INCLUÍDO
                </Badge>
              </div>

              <CardContent className="pt-12 pb-8">
                <div className="text-center mb-8">
                  <div className="mb-6">
                    <span className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      R$ 35
                    </span>
                    <span className="text-gray-600 text-xl"> por colaborador/mês</span>
                  </div>
                  <p className="text-lg text-gray-700 font-medium">
                    Plataforma completa sem limitações
                  </p>
                </div>

                {/* Recursos em 2 colunas */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div>
                    <h4 className="font-bold text-lg text-indigo-600 mb-4">🧠 Avaliações e Testes</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Todos os testes psicossociais disponíveis</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">QVT, RPO, Clima Organizacional</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Estresse, Karasek-Siegrist, PAS e MGR</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-indigo-600 mb-4">📊 Análises e Dashboards</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Análises avançadas com IA</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Dashboards executivos interativos</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Relatórios individuais e setoriais</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-indigo-600 mb-4">📋 Compliance e Relatórios</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Relatórios NR-01 e ISO 45003</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">PGR Psicossocial completo</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Exportação PDF e Excel</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-indigo-600 mb-4">🚀 Recursos Avançados</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Colaboradores ilimitados</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Múltiplas empresas e unidades</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">API para integração ERP</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-indigo-600 mb-4">🎨 Personalização</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">White-label personalizável</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Relatórios customizados</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Branding da sua empresa</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-indigo-600 mb-4">👥 Suporte Premium</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Consultoria incluída (1h/mês)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Gestor de conta dedicado</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Suporte prioritário com SLA</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-4">
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6"
                    data-testid="button-solicitar-acesso"
                    onClick={() => window.location.href = 'https://buy.stripe.com/test_3cI5kE3gic0g04U2Cd6sw00'}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Solicitar Acesso
                  </Button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3"
                      data-testid="button-falar-especialista"
                      onClick={() => window.location.href = 'mailto:luizcarlos.bastos@gmail.com?subject=Solicitar Informações - HumaniQ AI'}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Falar com Especialista
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 py-3"
                      data-testid="button-ver-plataforma"
                      onClick={() => scrollToSection('demo')}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Ver Plataforma em Funcionamento
                    </Button>
                  </div>
                </div>

                {/* Garantia */}
                <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Shield className="h-5 w-5" />
                    <p className="font-semibold">Setup gratuito • Sem fidelidade • Cancele quando quiser</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proposta de Valor */}
          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-gray-900 mb-4">
              Compliance completa por menos de <span className="text-indigo-600">R$ 1,20 por dia</span> por colaborador
            </p>
            <p className="text-lg text-gray-600">
              Um investimento que se paga evitando uma única multa ou processo trabalhista
            </p>
          </div>
        </div>
      </section >

      {/* SEÇÃO 14: CTA FINAL */}
      < section id="diagnostico" className="py-12 md:py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white" >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Comece Hoje. Proteja Sua Empresa Amanhã.
          </h2>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-yellow-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">Diagnóstico Gratuito Completo + Demo da Plataforma</h3>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 p-6 rounded-xl">
                <h4 className="font-bold text-xl mb-4">O que você recebe sem custo:</h4>
                <ul className="space-y-3 text-left">
                  {[
                    'Avaliação de até 20 colaboradores',
                    'Mapa de risco psicossocial instantâneo',
                    'Página de Nível de Saúde da sua empresa',
                    'Relatório de maturidade organizacional',
                    'Demonstração ao vivo de todos os módulos',
                    'Consultoria inicial com especialista em SST'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 p-6 rounded-xl flex flex-col justify-center">
                <p className="text-2xl font-bold mb-4">Sem Riscos. Sem Complicações.</p>
                <ul className="space-y-2 text-left">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Sem cartão de crédito
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Sem compromisso
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Sem complicação
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <Button
              size="lg"
              onClick={() => navigate('/quick-check')}
              className="bg-white text-indigo-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl hover:shadow-3xl transition-all"
              data-testid="button-diagnostico-final"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Iniciar Diagnóstico Gratuito Agora
            </Button>
          </div>

          <p className="text-indigo-200 text-lg">
            Junte-se a centenas de empresas que já estão protegidas
          </p>
        </div>
      </section >

      {/* Modal de Comparação Detalhada */}
      < Dialog open={showComparison} onOpenChange={setShowComparison} >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Comparação Detalhada dos Planos
            </DialogTitle>
            <DialogDescription className="text-lg">
              Compare todos os recursos e escolha o plano perfeito para sua empresa
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-bold text-gray-900">Recursos</th>
                  <th className="text-center p-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">Essencial</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">R$ 15</p>
                      <p className="text-sm text-gray-600">/colab/mês</p>
                    </div>
                  </th>
                  <th className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="text-center">
                      <Badge className="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600">⭐ POPULAR</Badge>
                      <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Profissional</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-1">R$ 25</p>
                      <p className="text-sm text-gray-600">/colab/mês</p>
                    </div>
                  </th>
                  <th className="text-center p-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">Enterprise</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">R$ 35</p>
                      <p className="text-sm text-gray-600">/colab/mês</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Mínimo de colaboradores', essencial: '10', profissional: '20', enterprise: '100' },
                  { feature: 'Máximo de colaboradores', essencial: '50', profissional: '200', enterprise: 'Ilimitado' },
                  { feature: 'Ticket mínimo mensal', essencial: 'R$ 150', profissional: 'R$ 500', enterprise: 'R$ 3.500' },
                  { feature: 'Testes psicológicos', essencial: '3 básicos', profissional: '7 completos', enterprise: '7 completos' },
                  { feature: 'Análise com IA (Google Gemini)', essencial: false, profissional: true, enterprise: true },
                  { feature: 'Dashboard de resultados', essencial: 'Básico', profissional: 'Avançado', enterprise: 'Avançado' },
                  { feature: 'Relatórios de compliance (NR-1, ISO 45003)', essencial: false, profissional: true, enterprise: true },
                  { feature: 'Módulo PGR completo', essencial: false, profissional: true, enterprise: true },
                  { feature: 'Exportação PDF e Excel', essencial: false, profissional: true, enterprise: true },
                  { feature: 'API para integração', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Múltiplas empresas/unidades', essencial: false, profissional: false, enterprise: true },
                  { feature: 'White-label personalizado', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Consultoria especializada', essencial: false, profissional: false, enterprise: '1h/mês' },
                  { feature: 'Relatórios customizados', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Gestor de contas dedicado', essencial: false, profissional: false, enterprise: true },
                  { feature: 'Suporte', essencial: 'Email', profissional: 'Email + Chat', enterprise: 'SLA 4h úteis' },
                  { feature: 'Setup e Onboarding', essencial: 'Gratuito', profissional: 'Gratuito + Treinamento 1h', enterprise: 'Premium + Treinamento equipe' },
                  { feature: 'Atualizações', essencial: 'Incluídas', profissional: 'Incluídas', enterprise: 'Incluídas + Preview' },
                  { feature: 'Desconto anual', essencial: '10% OFF', profissional: '10% OFF', enterprise: '10% OFF' },
                ].map((row, index) => (
                  <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="p-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.essencial === 'boolean' ? (
                        row.essencial ? (
                          <Check className="h-6 w-6 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.essencial}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                      {typeof row.profissional === 'boolean' ? (
                        row.profissional ? (
                          <Check className="h-6 w-6 text-indigo-600 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700 font-semibold">{row.profissional}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="h-6 w-6 text-purple-600 mx-auto" />
                        ) : (
                          <X className="h-6 w-6 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-700">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                setShowComparison(false);
                scrollToSection('diagnostico');
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Começar Teste Gratuito
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowComparison(false)}
            >
              Fechar Comparação
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* SEÇÃO E-E-A-T: SOBRE O HUMANIQ AI */}
      < section className="py-12 bg-white border-t border-gray-100" >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Sobre o HumaniQ AI</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            O HumaniQ AI é um <strong>Software NR-01</strong> completo desenvolvido por especialistas em Saúde e Segurança
            do Trabalho, Psicologia Organizacional e Compliance Trabalhista, com foco exclusivo
            na gestão de <a href="/riscos-psicossociais" className="text-indigo-600 hover:underline">riscos psicossociais</a> conforme a <a href="/nr01" className="text-indigo-600 hover:underline">NR-01</a> e diretrizes do Ministério do Trabalho e Emprego (MTE).
          </p>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-gray-900 text-gray-300 py-12" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="md" showText={true} className="mb-4 [&>span]:text-white" />
              <p className="text-sm">
                Plataforma completa para gestão de riscos psicossociais em conformidade com a NR-01.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('modulos')} className="hover:text-white">Módulos</button></li>
                <li><button onClick={() => scrollToSection('planos')} className="hover:text-white">Planos e Preços</button></li>
                <li><button onClick={() => scrollToSection('depoimentos')} className="hover:text-white">Casos de Sucesso</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 HumaniQ AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer >
      <section id="contato-demo" className="py-12 md:py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-yellow-400 text-gray-900 px-4 py-2 font-bold" data-testid="badge-contato-demo">
              Agende sua Demonstração
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3">
              Experimente o HumaniQ AI ao vivo
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Imagine sua diretoria visualizando, em poucos minutos, o mapa real de riscos psicossociais da empresa. Decida agora: uma conversa rápida pode evitar meses de incerteza.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-200 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                  <p className="text-gray-900 text-lg font-semibold">Demonstração guiada por especialista</p>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    Veja dashboards, relatórios PGR e trilha de certificação
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    Entenda como a IA propõe planos de ação específicos
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    Prove valor rápido: resultados práticos em 30 minutos
                  </li>
                </ul>
                <div className="mt-6 bg-amber-100 border-l-4 border-amber-500 p-4 rounded">
                  <p className="text-sm text-amber-900 font-semibold">Vagas limitadas nesta semana. Garanta seu horário agora.</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
                <p className="text-gray-900 text-lg font-bold mb-4">Escolha seu canal preferido</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    data-testid="button-contato-whatsapp"
                    onClick={() => window.open('https://wa.me/5519983835867?text=Olá%2C%20quero%20agendar%20uma%20demonstração%20do%20HumaniQ%20AI.', '_blank')}
                    title="Agendar pelo WhatsApp"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50"
                    data-testid="button-contato-email"
                    onClick={() => {
                      const subject = encodeURIComponent('Agendamento de Demonstração - HumaniQ AI');
                      const body = encodeURIComponent('Olá,\n\nGostaria de agendar uma demonstração do HumaniQ AI para nossa empresa.\nObjetivo: entender mapeamento, relatórios PGR e trilha de certificação.\n\nMelhores horários:\n- [inserir]\n\nObrigado(a).');
                      window.location.href = `mailto:luizcarlos.bastos@gmail.com?subject=${subject}&body=${body}`;
                    }}
                    title="Agendar por Email"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Email
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-amber-200/50">
                  <p className="text-sm text-center text-gray-600 mb-3 font-medium">Ou inicie agora mesmo:</p>
                  <Button
                    size="lg"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-lg h-14"
                    onClick={() => scrollToSection('planos')}
                  >
                    Comece agora por <span className="text-yellow-300 font-bold ml-1">R$ 35/colaborador</span>
                  </Button>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">Resposta rápida. Compromisso de retorno em até 4h úteis.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <VinhedoFooter />
    </div >
  );
}
