import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, FileText, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SeoFooterCTA } from '../../components/seo/SeoFooterCTA';

const NR01Page = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <SeoHead
                title="NR 01 2024: Guia Completo e Software para Implementação | HumaniQ AI"
                description="Implemente a NR 01 com nosso software especializado. Evite multas, gerencie requisitos e garanta conformidade trabalhista. Solicite demonstração!"
                canonicalUrl="/nr01"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "NR 01: Guia Completo de Implementação para 2026",
                    "author": { "@type": "Organization", "name": "HumaniQ AI" },
                    "description": "Guia definitivo sobre a Norma Regulamentadora 01, Gerenciamento de Riscos Ocupacionais (GRO) e PGR.",
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": "https://www.humaniqai.com.br/nr01"
                    }
                }}
            />

            {/* Hero Section */}
            <div className="bg-slate-900 text-white pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-600/30 border border-blue-500 text-blue-300 text-sm font-bold mb-4">
                        Atualizado para 2026
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        NR 01: O Guia Definitivo da Norma Regulamentadora 1
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                        Entenda o Gerenciamento de Riscos Ocupacionais (GRO), o PGR e como evitar as pesadas multas da nova fiscalização digital.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/quick-check">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 font-bold px-8">
                                Diagnóstico NR-01 Gratuito
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Navigation Breadcrumb */}
                <nav className="mb-8 text-sm text-slate-500">
                    <Link to="/" className="hover:text-blue-600">Home</Link> &gt; <span className="text-slate-900 font-semibold">Guia NR-01</span>
                </nav>

                <div className="prose prose-lg prose-slate max-w-none bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">

                    {/* Introduction */}
                    <p className="lead text-xl text-slate-700 mb-8 border-l-4 border-blue-600 pl-4">
                        A <strong>Norma Regulamentadora nº 01 (NR-01)</strong> é a norma "mãe" de todas as normas de segurança do trabalho. Ela estabelece as disposições gerais e o gerenciamento de riscos ocupacionais que todas as empresas devem seguir. Se sua empresa tem 1 funcionário CLT, você já está obrigado a cumpri-la.
                    </p>

                    <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
                        <FileText className="text-blue-600" />
                        O que mudou na NR-01?
                    </h2>
                    <p>
                        A grande revolução da nova NR-01 foi a introdução do <strong>GRO (Gerenciamento de Riscos Ocupacionais)</strong> e do <strong>PGR (Programa de Gerenciamento de Riscos)</strong>.
                    </p>
                    <p>
                        Antigamente, as empresas focavam apenas nos riscos físicos, químicos e biológicos (o antigo PPRA). Agora, a norma exige explicitamente a gestão de <strong>todos os riscos ocupacionais</strong>, incluindo:
                    </p>
                    <ul className="grid md:grid-cols-2 gap-4 not-prose my-6">
                        <li className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <CheckCircle className="text-green-500 mr-2 w-5 h-5" /> Riscos Físicos (ruído, calor)
                        </li>
                        <li className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <CheckCircle className="text-green-500 mr-2 w-5 h-5" /> Riscos Químicos (poeiras, gases)
                        </li>
                        <li className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <CheckCircle className="text-green-500 mr-2 w-5 h-5" /> Riscos Biológicos (vírus, bactérias)
                        </li>
                        <li className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <CheckCircle className="text-green-500 mr-2 w-5 h-5" /> Riscos Ergonômicos (postura, esforço)
                        </li>
                        <li className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200 font-bold text-amber-900">
                            <AlertTriangle className="text-amber-500 mr-2 w-5 h-5" /> Riscos Psicossociais (estresse, assédio)
                        </li>
                    </ul>

                    <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">GRO vs. PGR: Qual a diferença?</h2>
                    <p>
                        Muitos gestores confundem os dois termos. Vamos esclarecer de vez:
                    </p>
                    <div className="my-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-xl font-bold text-blue-900 mb-2">GRO (Gerenciamento)</h3>
                                <p className="text-sm text-blue-800">
                                    É a <strong>estratégia</strong>. É o processo contínuo de identificar perigos, avaliar riscos e implementar medidas de controle. O GRO não é um documento, é uma ação constante da empresa.
                                </p>
                            </div>
                            <div className="flex-1 bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                                <h3 className="text-xl font-bold text-emerald-900 mb-2">PGR (Programa)</h3>
                                <p className="text-sm text-emerald-800">
                                    É o <strong>documento</strong>. É a materialização do GRO em papel (ou sistema). O PGR deve conter, no mínimo, o Inventário de Riscos e o Plano de Ação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6 flex items-center gap-3">
                        <Shield className="text-blue-600" />
                        Obrigação dos Riscos Psicossociais
                    </h2>
                    <p>
                        Este é o ponto onde a maioria das empresas falha. A NR-01 (item 1.5.3.1) e a NR-17 exigem que os fatores psicossociais sejam avaliados. Isso inclui:
                    </p>
                    <ul className="list-disc pl-6 mb-6">
                        <li>Sobrecarga mental e de trabalho;</li>
                        <li>Violência e assédio no trabalho;</li>
                        <li>Falta de autonomia e suporte social;</li>
                        <li>Jornadas exaustivas e pressão por metas.</li>
                    </ul>
                    <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500 my-6">
                        <p className="font-bold text-yellow-900 text-lg mb-2">⚠ Atenção para a Fiscalização</p>
                        <p className="text-yellow-800">
                            Auditores do MTE estão utilizando dados de afastamentos do INSS (B33, F32) para cruzar com seu PGR. Se você tem afastamentos por ansiedade/depressão e seu PGR diz que "não há riscos psicossociais", sua empresa será multada automaticamente por inconsistência e omissão de perigo.
                        </p>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">Como Implementar a NR-01 (Passo a Passo)</h2>
                    <p>Para estar em conformidade total, siga este roteiro de implementação:</p>

                    <div className="steps-container space-y-8 my-8">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 m-0">Levantamento Preliminar de Perigos</h3>
                                <p className="text-slate-600 mt-2">Identifique todas as fontes de risco na empresa. Entreviste colaboradores e  verifique o histórico de acidentes e afastamentos.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 m-0">Avaliação de Riscos (Probabilidade x Severidade)</h3>
                                <p className="text-slate-600 mt-2">Classifique o nível de cada risco. Para riscos psicossociais, use ferramentas validadas (escalas psicométricas) para garantir objetividade.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 m-0">Elaboração do Inventário de Riscos</h3>
                                <p className="text-slate-600 mt-2">Documente tudo. O inventário deve conectar cada risco à sua fonte, aos trabalhadores expostos e à sua classificação de risco.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 m-0">Plano de Ação</h3>
                                <p className="text-slate-600 mt-2">Para cada risco relevante, estabeleça uma medida de controle com prazo e responsável. Ex: Treinamento de liderança, revisão de metas, apoio psicológico.</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mt-12 mb-6">Tabela de Multas da NR-01 (2025/2026)</h2>
                    <p>As multas são aplicadas por infração e por número de funcionários. Veja os valores estimados para infrações recorrentes:</p>

                    <div className="overflow-x-auto my-6">
                        <table className="min-w-full text-sm text-left text-slate-600 border border-slate-200">
                            <thead className="bg-slate-50 text-slate-900 font-bold uppercase">
                                <tr>
                                    <th className="px-6 py-3 border-b">Infração</th>
                                    <th className="px-6 py-3 border-b">Valor Mínimo</th>
                                    <th className="px-6 py-3 border-b">Valor Máximo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Deixar de elaborar o PGR</td>
                                    <td className="px-6 py-4">R$ 1.799,31</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">R$ 5.869,63</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Não implementar medidas de controle</td>
                                    <td className="px-6 py-4">R$ 2.308,44</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">R$ 6.708,08</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Não informar riscos aos trabalhadores</td>
                                    <td className="px-6 py-4">R$ 1.200,50</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">R$ 4.580,22</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-slate-400 mt-2">* Valores baseados na UFIR e porte da empresa, sujeitos a atualização.</p>
                    </div>

                    <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl my-12 text-center">
                        <h3 className="text-2xl font-bold mb-4">Pare de correr riscos desnecessários</h3>
                        <p className="mb-8 text-indigo-100 text-lg">
                            Você pode automatizar todo esse processo. A HumaniQ AI mapeia os riscos psicossociais, gera o inventário e cria o plano de ação automaticamente.
                        </p>
                        <Link to="/quick-check">
                            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 py-6 text-lg">
                                Testar Plataforma Gratuitamente
                            </Button>
                        </Link>
                    </div>

                    {/* FAQ Section */}
                    <div className="border-t border-slate-200 pt-12 mt-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                            <HelpCircle className="text-blue-600" />
                            Perguntas Frequentes sobre NR-01
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h4 className="font-bold text-lg text-slate-900 mb-2">O PPRA acabou?</h4>
                                <p className="text-slate-600">Sim. O PPRA (Programa de Prevenção de Riscos Ambientais) foi substituído pelo PGR (Programa de Gerenciamento de Riscos). O PGR é mais amplo e inclui riscos ergonômicos e mecânicos que o PPRA não cobria.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h4 className="font-bold text-lg text-slate-900 mb-2">Quem pode assinar o PGR?</h4>
                                <p className="text-slate-600">O PGR pode ser elaborado por profissional qualificado em segurança do trabalho. A empresa pode ter um SESMT próprio ou contratar consultoria externa. A HumaniQ AI fornece a base técnica para que o profissional assine com segurança.</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-lg">
                                <h4 className="font-bold text-lg text-slate-900 mb-2">Com que frequência devo atualizar o PGR?</h4>
                                <p className="text-slate-600">O PGR deve ser revisto a cada 2 anos, ou sempre que houver mudanças nos processos, novos riscos identificados ou ocorrência de acidentes/doenças. Empresas com sistemas de gestão certificadas podem rever a cada 3 anos.</p>
                            </div>
                        </div>

                        <SeoFooterCTA />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NR01Page;
