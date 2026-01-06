import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

const RiscosPsicoPage = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Avaliação de Riscos Psicossociais",
        "provider": {
            "@type": "Organization",
            "name": "HumaniQ AI"
        },
        "description": "Avaliação completa de fatores de risco psicossocial no trabalho utilizando protocolos validados e IA."
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "O que são riscos psicossociais no trabalho?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "São aspectos da organização e gestão do trabalho que podem causar danos à saúde física ou psíquica do trabalhador, como estresse, burnout e ansiedade."
                }
            },
            {
                "@type": "Question",
                "name": "A avaliação de riscos psicossociais é obrigatória?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sim. A nova redação da NR-01 exige que o gerenciamento de riscos ocupacionais (GRO) inclua todos os perigos, incluindo os psicossociais."
                }
            },
            {
                "@type": "Question",
                "name": "Como a ISO 45003 ajuda na gestão desses riscos?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A ISO 45003 fornece diretrizes internacionais para gerenciar a saúde psicossocial, propondo intervenções primárias (organizacionais), secundárias (equipes) e terciárias (individuais)."
                }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Riscos Psicossociais no Trabalho: Identificação e Gestão | HumaniQ AI"
                description="Mapeie, avalie e gerencie riscos psicossociais na sua empresa. Software completo com metodologia validada. Previna burnout e aumente produtividade."
                canonicalUrl="/riscos-psicossociais"
                schema={[schema, faqSchema]}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="mb-8 text-sm text-slate-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link> &gt; <span className="text-slate-900">Riscos Psicossociais</span>
                </nav>

                <h1 className="text-4xl font-bold mb-6 text-slate-900">Gestão de Riscos Psicossociais no Ambiente de Trabalho</h1>

                <div className="prose prose-lg max-w-none text-slate-700">
                    <p className="lead text-lg mb-8">
                        Riscos psicossociais são elementos do desenho, organização e gestão do trabalho que podem causar danos psicológicos ou físicos aos colaboradores.
                        Fatores como <strong>sobrecarga</strong>, <strong>assédio moral</strong>, <strong>falta de suporte</strong> e <strong>jornadas excessivas</strong> não afetam apenas o indivíduo, mas comprometem o resultado de toda a empresa.
                    </p>

                    <p className="mb-6">
                        Com a HumaniQ AI, o RH deixa de ser reativo e passa a ser preditivo:
                    </p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-indigo-600">✓</div>
                            <div>
                                <strong>Avaliações Validadas:</strong> Utilize instrumentos científicos para medir estresse, ansiedade e satisfação no trabalho.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-indigo-600">✓</div>
                            <div>
                                <strong>Dashboards de Saúde Mental:</strong> Visualize em tempo real quais departamentos apresentam maiores indicadores de risco.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-indigo-600">✓</div>
                            <div>
                                <strong>Redução de Absenteísmo:</strong> Identifique causas precoces de afastamentos e doenças ocupacionais (Burnout).
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="min-w-6 mt-1 text-indigo-600">✓</div>
                            <div>
                                <strong>Cultura de Bem-Estar:</strong> Promova um ambiente psicologicamente seguro, aumentando o engajamento e a produtividade.
                            </div>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-6">Perguntas Frequentes</h2>
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-slate-900">O que são riscos psicossociais no trabalho?</h3>
                            <p>São aspectos da organização e gestão do trabalho que podem causar danos à saúde física ou psíquica do trabalhador, como estresse, burnout e ansiedade.</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-slate-900">A avaliação de riscos psicossociais é obrigatória?</h3>
                            <p>Sim. A nova redação da NR-01 exige que o gerenciamento de riscos ocupacionais (GRO) inclua todos os perigos, incluindo os psicossociais.</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-slate-900">Como a ISO 45003 ajuda na gestão desses riscos?</h3>
                            <p>A ISO 45003 fornece diretrizes internacionais para gerenciar a saúde psicossocial, propondo intervenções primárias (organizacionais), secundárias (equipes) e terciárias (individuais).</p>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="font-medium text-slate-900 mb-2">Conformidade Legal:</p>
                        <Link to="/nr01" className="text-indigo-700 hover:underline font-semibold flex items-center gap-2">
                            Quer saber mais sobre as exigências da lei? Veja nosso guia da NR-01 <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiscosPsicoPage;
