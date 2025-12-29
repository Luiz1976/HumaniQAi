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
                title="Avaliação de Riscos Psicossociais | Ferramenta Online HumaniQ AI"
                description="Realize a avaliação de riscos psicossociais da sua empresa de forma digital e automática. Relatórios detalhados e planos de ação."
                canonicalUrl="/riscos-psicossociais"
                schema={[schema, faqSchema]}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="mb-8 text-sm text-slate-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link> &gt; <span className="text-slate-900">Riscos Psicossociais</span>
                </nav>

                <h1 className="text-4xl font-bold mb-6 text-slate-900">Avaliação de Riscos Psicossociais: Guia Completo e Metodologia</h1>

                <div className="prose prose-lg max-w-none text-slate-700">
                    <p className="lead text-xl mb-8">
                        Os riscos psicossociais são características das condições de trabalho e, sobretudo, da organização do trabalho, que afetam a saúde das pessoas através de mecanismos psicológicos e fisiológicos.
                        Diferente do "estresse comum", o risco psicossocial é uma falha na gestão organizacional que pode levar a doenças graves como Burnout, depressão e ansiedade generalizada.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Diferença entre Estresse e Risco Psicossocial</h2>
                    <p>
                        É crucial distinguir a causa da consequência. O <strong>estresse</strong> é a resposta do indivíduo. O <strong>risco psicossocial</strong> é a característica do trabalho que causa esse estresse.
                        Por exemplo: "Prazos impossíveis de cumprir" é o fator de risco. "Ansiedade e insônia do colaborador" são os danos causados. A NR-01 exige que a empresa atue na CAUSA (o risco), não apenas trate o sintoma.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Modelos Teóricos Validados</h2>
                    <p>
                        Para uma avaliação ser técnica e aceita juridicamente, ela não pode basear-se em "achismos". A HumaniQ AI utiliza uma combinação dos modelos mais respeitados mundialmente:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 my-6">
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-lg mb-2 text-indigo-700">Modelo Demanda-Controle (Karasek)</h4>
                            <p className="text-sm">
                                Postula que o maior risco para a saúde não é apenas ter muito trabalho (demanda), mas ter muito trabalho com <strong>baixa autonomia</strong> (controle) para decidir como fazê-lo.
                            </p>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-lg mb-2 text-indigo-700">Desequilíbrio Esforço-Recompensa (Siegrist)</h4>
                            <p className="text-sm">
                                Ocorre quando o colaborador sente que o esforço investido no trabalho é muito maior do que as recompensas recebidas (salário, estima, segurança, promoções).
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4">A Importância da ISO 45003</h2>
                    <p>
                        A ISO 45003 é a primeira norma global fornecendo diretrizes práticas para o gerenciamento de riscos psicossociais. Ela recomenda uma abordagem em três níveis, que nossa plataforma segue rigorosamente:
                    </p>
                    <ul className="space-y-4 my-6">
                        <li className="bg-green-50 p-4 rounded-lg">
                            <strong>Intervenção Primária (Organizacional):</strong> Atuar na fonte do problema. Ex: Redesenhar processos, ajustar cargas de trabalho, clarificar papéis. É a mais eficaz.
                        </li>
                        <li className="bg-yellow-50 p-4 rounded-lg">
                            <strong>Intervenção Secundária (Equipe/Líder):</strong> Capacitar líderes e equipes para lidar melhor com as demandas. Treinamentos de resiliência e comunicação.
                        </li>
                        <li className="bg-red-50 p-4 rounded-lg">
                            <strong>Intervenção Terciária (Individual):</strong> Reabilitação e apoio ao colaborador que já está adoecido. Psicologia clínica e retorno ao trabalho.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Metodologia HumaniQ AI</h2>
                    <p>
                        Nossa ferramenta operacionaliza toda essa teoria complexa em um fluxo simples para a empresa:
                    </p>
                    <ol className="list-decimal pl-6 mb-6 space-y-2">
                        <li><strong>Coleta Digital:</strong> Links individuais e anônimos enviados aos colaboradores.</li>
                        <li><strong>Processamento IA:</strong> Algoritmos cruzam os dados das respostas com os modelos teóricos.</li>
                        <li><strong>Mapa de Calor:</strong> Identificação visual de quais setores estão em "Zona de Perigo".</li>
                        <li><strong>Prescrição Automática:</strong> O sistema sugere ações de intervenção primária baseadas nos riscos específicos encontrados.</li>
                    </ol>
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
                </div>

                <div className="mt-12 bg-indigo-50 p-8 rounded-xl border border-indigo-100 text-center">
                    <h3 className="text-2xl font-bold mb-4 text-indigo-900">Leve ciência de dados para seu RH</h3>
                    <p className="mb-6 text-indigo-800">
                        Deixe de "apagar incêndios" e comece a gerir riscos com precisão cirúrgica.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/quick-check">
                            <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 font-bold">
                                Começar Avaliação Agora
                            </Button>
                        </Link>
                        <a href="https://api.whatsapp.com/send/?phone=5519983835867&text=Ol%C3%A1%2C+quero+entender+melhor+a+metodologia+de+avalia%C3%A7%C3%A3o+psicossocial.&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Conversar com Especialista
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiscosPsicoPage;
