import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, CheckCircle, TrendingUp, Users, Shield, Cpu } from 'lucide-react';
import { createBreadcrumbSchema } from '../../lib/seo/schemas';

const IAParaRHPage = () => {
    const breadcrumb = createBreadcrumbSchema([
        { name: 'Home', url: 'https://www.humaniqai.com.br' },
        { name: 'IA para RH', url: 'https://www.humaniqai.com.br/ia-para-rh-gestao-riscos' }
    ]);

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="IA para RH e Gestão de Pessoas | Tecnologia NR-01"
                description="Descubra como a Inteligência Artificial aplicado ao RH revoluciona a gestão de riscos psicossociais, conformidade NR-01 e saúde mental no trabalho."
                canonicalUrl="/ia-para-rh-gestao-riscos"
                schema={breadcrumb}
            />

            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-sm font-semibold mb-6">
                                <Cpu size={16} />
                                <span>Tecnologia de Ponta para RH</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Inteligência Artificial para RH: O Futuro da Gestão de Riscos
                            </h1>
                            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                                Abandone as planilhas e a subjetividade. A IA da HumaniQ analisa padrões de comportamento, prevê riscos de burnout e automatiza a conformidade com a NR-01.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/quick-check">
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg w-full sm:w-auto">
                                        Testar IA Grátis
                                    </Button>
                                </Link>
                                <Link to="/demo">
                                    <Button variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800 w-full sm:w-auto">
                                        Ver Demonstração
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl p-1 shadow-2xl">
                                <div className="bg-slate-900 rounded-xl p-8 h-96 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                    <Brain size={120} className="text-blue-500/20 absolute animate-pulse" />
                                    <div className="relative z-10 glass-panel p-6 rounded-xl border border-white/10">
                                        <div className="text-4xl font-bold text-white mb-2">94%</div>
                                        <div className="text-blue-200">Precisão na detecção de riscos</div>
                                        <div className="h-1 w-full bg-slate-700 mt-4 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[94%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vantagens Cluster */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Por que usar IA no RH?</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <TrendingUp />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Análise Preditiva</h3>
                            <p className="text-slate-600">Nossa IA identifica tendências de estresse e fadiga antes que se tornem afastamentos médicos, permitindo ação preventiva.</p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                                <Shield />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Compliance Automático</h3>
                            <p className="text-slate-600">Geração automática de relatórios técnicos para PGR e documentação NR-01, eliminando erro humano.</p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                                <Users />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Personalização em Escala</h3>
                            <p className="text-slate-600">Recomende planos de ação e treinamentos específicos para cada líder ou colaborador com base em seus resultados individuais.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Internal Linking / Clusters */}
            <section className="py-16 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">Explore mais sobre Tecnologia e Saúde Mental</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/riscos-psicossociais" className="px-6 py-3 bg-white rounded-full border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all font-medium">
                            Riscos Psicossociais
                        </Link>
                        <Link to="/software-nr01" className="px-6 py-3 bg-white rounded-full border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all font-medium">
                            Software NR-01
                        </Link>
                        <Link to="/blog/ia-gestao-pessoas" className="px-6 py-3 bg-white rounded-full border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all font-medium">
                            Artigo: IA na Gestão
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default IAParaRHPage;
