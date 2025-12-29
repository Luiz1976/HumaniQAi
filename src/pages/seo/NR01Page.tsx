import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

const NR01Page = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "NR-01 e Riscos Psicossociais: Guia Completo para Conformidade",
        "author": {
            "@type": "Organization",
            "name": "HumaniQ AI"
        },
        "publisher": {
            "@type": "Organization",
            "name": "HumaniQ AI",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.humaniqai.com.br/logo.png"
            }
        },
        "description": "Descubra como a NR-01 aborda os riscos psicossociais e o que sua empresa precisa fazer para estar em conformidade legal e promover a saúde mental."
    };

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Software para Gestão de Riscos Psicossociais em Conformidade com a NR-01 | HumaniQ AI"
                description="Automatize o seu PGR e evite passivos trabalhistas com a HumaniQ AI. Mapeamento sistemático, plano de ação automatizado e prevenção de multas."
                canonicalUrl="/nr01"
                schema={schema}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="mb-8 text-sm text-slate-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link> &gt; <span className="text-slate-900">Guia NR-01</span>
                </nav>

                <h1 className="text-4xl font-bold mb-2 text-slate-900">Software para Gestão de Riscos Psicossociais em Conformidade com a NR-01</h1>
                <h2 className="text-xl text-slate-600 mb-8 font-medium">Automatize o seu PGR e evite passivos trabalhistas com a HumaniQ AI.</h2>

                <div className="prose prose-lg max-w-none text-slate-700">
                    <p className="lead text-lg mb-8">
                        A Norma Regulamentadora 01 (NR-01) estabelece as diretrizes gerais para o <strong>Gerenciamento de Riscos Ocupacionais (GRO)</strong>.
                        Com as atualizações recentes, a identificação e o controle de <strong>riscos psicossociais</strong> tornaram-se obrigatórios para a composição do <strong>PGR (Programa de Gerenciamento de Riscos)</strong>.
                    </p>

                    <p className="mb-6">
                        O HumaniQ AI foi desenvolvido especificamente para atender às exigências técnicas do Ministério do Trabalho e Emprego. Nossa plataforma facilita:
                    </p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-green-600">✓</div>
                            <div>
                                <strong>Inventário de Riscos:</strong> Mapeamento sistemático de fatores psicossociais conforme exigido pela norma.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-green-600">✓</div>
                            <div>
                                <strong>Plano de Ação Automatizado:</strong> Geração de medidas preventivas e corretivas com cronograma de implementação.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-green-600">✓</div>
                            <div>
                                <strong>Prevenção de Multas:</strong> Evite sanções que podem variar de R$ 1.799 a R$ 6.708 por infração diária.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-green-600">✓</div>
                            <div>
                                <strong>Histórico Auditável:</strong> Mantenha toda a documentação pronta para fiscalizações ativas e auditorias.
                            </div>
                        </li>
                    </ul>

                    <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200 text-center sm:text-left">
                        <p className="font-medium text-slate-900 mb-2">Continue aprendendo:</p>
                        <Link to="/riscos-psicossociais" className="text-blue-600 hover:underline font-semibold flex items-center justify-center sm:justify-start gap-2">
                            Quer saber mais sobre o impacto na saúde mental? Veja nosso guia de Riscos Psicossociais <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-12 bg-blue-50 p-8 rounded-xl border border-blue-100 text-center">
                    <h3 className="text-2xl font-bold mb-4 text-blue-900">Evite multas e proteja sua equipe</h3>
                    <p className="mb-6 text-blue-800">
                        Faça uma avaliação rápida e veja se sua empresa está em conformidade.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/quick-check">
                            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold">
                                Fazer Diagnóstico Gratuito
                            </Button>
                        </Link>
                        <a href="https://api.whatsapp.com/send/?phone=5519983835867&text=Ol%C3%A1%2C+vi+o+artigo+sobre+NR-01+e+quero+conhecer+a+plataforma.&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Falar com Consultor
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NR01Page;
