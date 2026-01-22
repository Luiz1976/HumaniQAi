import React from 'react';
import { SeoHead } from '../../../components/seo/SeoHead';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { SeoFooterCTA } from '../../../components/seo/SeoFooterCTA';

import { createBreadcrumbSchema, createBlogPostingSchema } from '../../../lib/seo/schemas';

const NR01Artigo = () => {
    const breadcrumb = createBreadcrumbSchema([
        { name: 'Home', url: 'https://www.humaniqai.com.br' },
        { name: 'Blog', url: 'https://www.humaniqai.com.br/blog' },
        { name: 'NR-01 e Compliance 2026', url: 'https://www.humaniqai.com.br/blog/nr01-2026' }
    ]);

    const articleSchema = createBlogPostingSchema(
        "NR-01 e Riscos Psicossociais: Guia Completo 2026",
        "Guia definitivo sobre a gestão de riscos psicossociais na NR-01 para 2026. Entenda as obrigações, evite multas de até R$ 6.708 e proteja sua empresa.",
        "https://www.humaniqai.com.br/images/blog/nr01-post.webp",
        "2026-01-06", // Updated date
        "2026-01-06",
        "https://www.humaniqai.com.br/blog/nr01-2026"
    );

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="NR-01 e Riscos Psicossociais: Guia Completo 2026 | HumaniQ AI"
                description="Guia definitivo sobre a gestão de riscos psicossociais na NR-01 para 2026. Entenda as obrigações, evite multas e proteja sua empresa."
                canonicalUrl="/blog/nr01-2026"
                schema={[breadcrumb, articleSchema]}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Blog
                </Link>

                <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 w-full bg-slate-100 relative">
                        {/* Placeholder for actual image if available, else a colored pattern */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white p-12">
                            <div className="text-center">
                                <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold mb-4">Atualizado 2026</span>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">NR-01 e Riscos Psicossociais</h1>
                                <p className="text-xl text-blue-100">Guia Completo para Gestão de Compliance</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">
                            <span className="font-semibold text-blue-600">Por Equipe HumaniQ</span>
                            <span>•</span>
                            <span>06 de Janeiro de 2026</span>
                            <span>•</span>
                            <span>12 min de leitura</span>
                        </div>

                        <div className="prose prose-slate prose-lg max-w-none">
                            <p className="lead text-xl text-slate-600 mb-8 font-light leading-relaxed">
                                A gestão de riscos ocupacionais no Brasil passou por uma transformação radical. A partir de 2026,
                                a fiscalização da <strong>Norma Regulamentadora 01 (NR-01)</strong> intensificou-se especificamente sobre os riscos psicossociais.
                                Empresas que ignoram fatores como estresse, burnout, assédio e sobrecarga mental não estão apenas perdendo talentos:
                                estão expostas a multas pesadas e passivos trabalhistas milionários. Este guia completo desmistifica tudo o que você precisa saber.
                            </p>

                            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
                                <h4 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    O que está em jogo?
                                </h4>
                                <p className="text-blue-800 m-0">
                                    O não cumprimento das novas diretrizes da NR-01 sobre riscos psicossociais pode acarretar multas que variam
                                    de <strong>R$ 1.799 a R$ 6.708 por infração/dia</strong>, além de ações civis públicas promovidas pelo Ministério Público do Trabalho (MPT).
                                </p>
                            </div>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">1. O Novo Contexto da NR-01 em 2026</h2>
                            <p>
                                A NR-01, que trata das Disposições Gerais e Gerenciamento de Riscos Ocupacionais (GRO), sempre teve como objetivo estabelecer os requisitos para a gestão de segurança e saúde no trabalho. No entanto, a grande mudança de paradigma consolidada em 2026 é a <strong>obrigatoriedade explícita e detalhada</strong> da inclusão dos riscos psicossociais no Programa de Gerenciamento de Riscos (PGR).
                            </p>
                            <p>
                                Antes vistos como "subjetivos" ou "difíceis de mensurar", fatores como assédio moral, excesso de cobrança, falta de autonomia e conflitos interpessoais agora possuem metodologias de avaliação validadas e exigidas pelos auditores fiscais do trabalho.
                            </p>

                            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">1.1. O que são Riscos Psicossociais segundo a norma?</h3>
                            <p>
                                A Organização Internacional do Trabalho (OIT) e a NR-01 definem riscos psicossociais como as interações entre o conteúdo, a organização e a gestão do trabalho e as condições ambientais, por um lado, e as competências e necessidades dos trabalhadores, por outro. Quando há um desequilíbrio, surgem riscos como:
                            </p>
                            <ul className="list-none space-y-3 pl-0 my-6">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Sobrecarga de trabalho:</strong> Prazos inviáveis, acúmulo de funções e pressão excessiva.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Falta de autonomia:</strong> O trabalhador não tem controle sobre seu ritmo ou método de trabalho.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Relações interpessoais precárias:</strong> Conflitos não geridos, falta de apoio da liderança e isolamento.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                    <span><strong>Violência e Assédio:</strong> Práticas de assédio moral, sexual ou discriminação (em consonância com a Lei 14.457/22).</span>
                                </li>
                            </ul>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">2. Obrigações Legais da Empresa (Checklist Obrigatório)</h2>
                            <p>
                                Para estar em 100% de conformidade, sua empresa precisa evidenciar documentalmente as seguintes etapas do GRO:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 my-8">
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h4 className="font-bold text-slate-900 mb-2">1. Identificação de Perigos</h4>
                                    <p className="text-sm text-slate-600">Mapear quais fatores psicossociais estão presentes em cada setor ou cargo.</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h4 className="font-bold text-slate-900 mb-2">2. Avaliação de Riscos</h4>
                                    <p className="text-sm text-slate-600">Classificar o nível de risco (Probabilidade x Severidade) usando matrizes de risco adaptadas para saúde mental.</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h4 className="font-bold text-slate-900 mb-2">3. Controle de Riscos</h4>
                                    <p className="text-sm text-slate-600">Implementar medidas preventivas (treinamentos, canais de denúncia, redesenho de tarefas).</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h4 className="font-bold text-slate-900 mb-2">4. Monitoramento da Saúde</h4>
                                    <p className="text-sm text-slate-600">Acompanhar indicadores de saúde (PCMSO) correlacionados com os riscos levantados.</p>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">3. Como Realizar a Avaliação de Riscos Psicossociais</h2>
                            <p>
                                Diferente do ruído ou calor, você não usa um aparelho para medir o estresse. A avaliação exige <strong>ferramentas psicométricas validadas</strong> e análise de dados organizacionais.
                            </p>

                            <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-800">3.1. Ferramentas Recomendadas</h3>
                            <p>
                                O Conselho Federal de Psicologia e as diretrizes da NR-01 sugerem o uso de escalas validadas cientificamente. As mais comuns incluem:
                            </p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Ecos (Escala de Coping Ocupacional):</strong> Avalia como os trabalhadores lidam com estressores.</li>
                                <li><strong>JSS (Job Stress Scale):</strong> Baseada no modelo Demanda-Controle de Karasek.</li>
                                <li><strong>MBI (Maslach Burnout Inventory):</strong> Padrão ouro para identificar Síndrome de Burnout.</li>
                            </ul>
                            <p>
                                <strong>Atenção:</strong> A aplicação manual desses testes em planilhas é ineficiente e perigosa, pois pode ferir o sigilo exigido pela LGPD. O uso de softwares especializados garante anonimato e precisão na tabulação.
                            </p>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">4. O Papel do PGR (Programa de Gerenciamento de Riscos)</h2>
                            <p>
                                O PGR é o documento vivo onde tudo isso se consolida. No capítulo de riscos psicossociais do seu PGR, deve constar:
                            </p>
                            <ol className="list-decimal pl-6 mb-6 space-y-3">
                                <li><strong>Inventário de Riscos:</strong> Lista completa dos perigos identificados por função.</li>
                                <li><strong>Plano de Ação:</strong> Cronograma de intervenções (ex: "Implementar política de desconexão até Março/2026").</li>
                                <li><strong>Critérios de Avaliação:</strong> Metodologia utilizada para definir se um risco é leve, moderado ou crítico.</li>
                            </ol>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">5. Tecnologia como Aliada: Por que usar Software?</h2>
                            <p>
                                Gerenciar riscos psicossociais em planilhas de Excel tornou-se inviável em 2026 devido à complexidade e necessidade de proteção de dados sensíveis. Softwares como o <strong>HumaniQ AI</strong> oferecem:
                            </p>
                            <ul className="list-none space-y-4 my-6">
                                <li className="flex gap-4">
                                    <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-600"><FileText size={20} /></div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">Automação de Coleta</h5>
                                        <p className="text-sm">Envio automático de testes validados para os colaboradores, com garantia de sigilo.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-600"><AlertTriangle size={20} /></div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">Mapas de Calor de Risco</h5>
                                        <p className="text-sm">Visualização imediata de quais departamentos estão em "Zonas de Perigo" para Burnout.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-600"><CheckCircle size={20} /></div>
                                    <div>
                                        <h5 className="font-bold text-slate-900">Relatórios de Conformidade</h5>
                                        <p className="text-sm">Geração automática dos documentos exigidos em uma fiscalização do MTE.</p>
                                    </div>
                                </li>
                            </ul>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">Conclusão: O Custo da Inação</h2>
                            <p>
                                Ignorar os riscos psicossociais não é mais uma opção. Além das multas da NR-01, empresas enfrentam custos ocultos gigantescos com turnover (substituição de pessoal), absenteísmo (faltas) e presenteísmo (estar lá, mas não produzir).
                            </p>
                            <p>
                                Em 2026, saúde mental é sinônimo de sustentabilidade do negócio. Adequar-se não é apenas "cumprir tabela", é investir na longevidade da sua empresa.
                            </p>

                            <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center text-white">
                                <h3 className="text-2xl font-bold mb-4">Sua empresa está pronta para uma fiscalização hoje?</h3>
                                <p className="mb-8 text-slate-300 max-w-2xl mx-auto">
                                    Faça um diagnóstico rápido e gratuito agora mesmo. Descubra seu nível de conformidade com a NR-01 e receba um plano de ação preliminar.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link to="/quick-check">
                                        <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                                            Fazer Diagnóstico Gratuito
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link to="/contato">
                                        <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white py-6">
                                            Falar com Especialista
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                <SeoFooterCTA />
            </div>
        </div>
    );
};

export default NR01Artigo;
