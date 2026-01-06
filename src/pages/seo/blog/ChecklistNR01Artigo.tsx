import React from 'react';
import { SeoHead } from '../../../components/seo/SeoHead';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Shield, AlertCircle, FileCheck, DollarSign } from 'lucide-react';
import { createBreadcrumbSchema, createBlogPostingSchema } from '../../../lib/seo/schemas';

const ChecklistNR01Artigo = () => {
    const breadcrumb = createBreadcrumbSchema([
        { name: 'Home', url: 'https://www.humaniqai.com.br' },
        { name: 'Blog', url: 'https://www.humaniqai.com.br/blog' },
        { name: 'Checklist Anti-Multas NR-01', url: 'https://www.humaniqai.com.br/blog/checklist-multas-nr01' }
    ]);

    const articleSchema = createBlogPostingSchema(
        "Como Evitar Multas da NR-01: Checklist Passo a Passo",
        "Aprenda como blindar sua empresa contra multas da NR-01 em 2026. Checklist completo de documentação, processos e treinamentos obrigatórios.",
        "https://www.humaniqai.com.br/images/blog/mapeamento-post.png",
        "2026-01-07",
        "2026-01-07",
        "https://www.humaniqai.com.br/blog/checklist-multas-nr01"
    );

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Como Evitar Multas da NR-01: Checklist Passo a Passo (2026)"
                description="Checklist completo para evitar multas da NR-01. Saiba exatamente o que o auditor fiscal vai cobrar sobre riscos psicossociais e PGR."
                canonicalUrl="/blog/checklist-multas-nr01"
                schema={[breadcrumb, articleSchema]}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Blog
                </Link>

                <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 w-full bg-slate-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from- emerald-800 to-slate-900 flex items-center justify-center text-white p-12">
                            <div className="text-center relative z-10">
                                <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-bold mb-4 uppercase tracking-wider">Passo a Passo</span>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4">Checklist Anti-Multas NR-01</h1>
                                <p className="text-xl text-slate-300">Como blindar sua empresa em 2026</p>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                <Shield size={200} />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">
                            <span className="font-semibold text-emerald-600">Compliance & Legal</span>
                            <span>•</span>
                            <span>07 de Janeiro de 2026</span>
                            <span>•</span>
                            <span>10 min de leitura</span>
                        </div>

                        <div className="prose prose-slate prose-lg max-w-none">
                            <p className="lead text-xl text-slate-600 mb-8 font-light leading-relaxed">
                                Você sabia que a falta de um Inventário de Riscos atualizado pode gerar uma multa imediata de mais de <strong>R$ 2.400,00</strong>?
                                E que a ausência de treinamentos pode multiplicar esse valor? Em 2026, a fiscalização eletrônica e presencial está focada em inconsistências no PGR.
                                Preparamos este checklist definitivo para você auditar sua empresa antes que o fiscal bata à porta.
                            </p>

                            <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
                                <h4 className="text-red-900 font-bold mb-2 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Realidade das Multas em 2026
                                </h4>
                                <p className="text-red-800 mb-0">
                                    As multas são cumulativas. Uma empresa média com irregularidades no Inventário, Plano de Ação e Treinamentos pode facilmente ultrapassar <strong>R$ 25.000,00</strong> em uma única fiscalização.
                                </p>
                            </div>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">Fase 1: Documentação Obrigatória (PGR)</h2>
                            <p className="mb-6">
                                O Programa de Gerenciamento de Riscos (PGR) é o coração da NR-01. Verifique se você tem:
                            </p>

                            <div className="space-y-4 mb-12">
                                <CheckItem
                                    title="Inventário de Riscos Completo"
                                    desc="Deve incluir riscos físicos, químicos, biológicos, ergonômicos e de acidentes. O grande erro é esquecer os psicossociais!"
                                />
                                <CheckItem
                                    title="Avaliação de Riscos Psicossociais"
                                    desc="Documento comprovando que a empresa aplicou ferramentas para medir estresse e riscos mentais (ex: escalas validadas)."
                                />
                                <CheckItem
                                    title="Matriz de Risco Atualizada"
                                    desc="Classificação clara de probabilidade e severidade para cada risco identificado."
                                />
                                <CheckItem
                                    title="Plano de Ação com Cronograma"
                                    desc="Não basta listar o problema. Tem que ter data para resolver e responsável nomeado."
                                />
                            </div>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">Fase 2: Evidências de Execução</h2>
                            <p className="mb-6">
                                O fiscal não quer apenas papel; ele quer provas de que o programa roda na prática.
                            </p>

                            <div className="space-y-4 mb-12">
                                <CheckItem
                                    title="Comprovação de Treinamentos"
                                    desc="Listas de presença e certificados dos treinamentos de NR-01 (básico, intermediário ou avançado) para todos os colaboradores."
                                />
                                <CheckItem
                                    title="Registros de Entrega de EPIs (se aplicável)"
                                    desc="Ficha de EPI assinada digitalmente ou fisicamente."
                                />
                                <CheckItem
                                    title="Histórico de Revisões do PGR"
                                    desc="O PGR deve ser revisto a cada 2 anos ou sempre que houver mudanças nos processos. Tenha o histórico de versões."
                                />
                                <CheckItem
                                    title="Integração com PCMSO"
                                    desc="O médico do trabalho deve ter acesso ao PGR para elaborar o PCMSO. A falta de coerência entre os dois documentos é multa na certa."
                                />
                            </div>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">Fase 3: Riscos Psicossociais (O Novo Foco)</h2>
                            <p className="mb-6">
                                A área onde a maioria das empresas falha. Verifique com atenção:
                            </p>

                            <div className="space-y-4 mb-12">
                                <CheckItem
                                    title="Canal de Denúncias/Escuta"
                                    desc="Existência e divulgação de um canal para relatos de assédio e discriminação (Lei 14.457/22 + NR-01)."
                                />
                                <CheckItem
                                    title="Ações de Mitigação de Burnout"
                                    desc="Evidências de ações para reduzir sobrecarga (revisão de metas, pausas, controle de jornada)."
                                />
                                <CheckItem
                                    title="Sigilo das Avaliações"
                                    desc="Garantia de que dados individuais de saúde mental não são expostos. Use softwares que garantam anonimato."
                                />
                            </div>

                            <h2 className="text-3xl font-bold mt-12 mb-6 text-slate-900">Como se Organizar Agora?</h2>
                            <p>
                                Fazer tudo isso manualmente é pedir para errar. Planilhas desatualizadas, documentos perdidos em e-mails e prazos esquecidos são as causas raiz das multas.
                            </p>
                            <p>
                                <strong>A solução é centralizar.</strong> Um software de gestão de NR-01:
                            </p>
                            <ul className="list-disc pl-6 mb-8 space-y-2">
                                <li>Avisa quando um documento vai vencer.</li>
                                <li>Garante o versionamento automático do PGR.</li>
                                <li>Coleta assinaturas digitais nos treinamentos.</li>
                                <li>Realiza as avaliações psicossociais com sigilo garantido.</li>
                            </ul>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 mt-12">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-emerald-900 mb-3">Auditoria Gratuita de Riscos</h3>
                                        <p className="text-emerald-800 mb-4">
                                            Não espere a multa chegar. Use nossa ferramenta gratuita para fazer um check-up rápido da conformidade da sua empresa.
                                        </p>
                                        <Link to="/quick-check">
                                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto">
                                                Iniciar Auditoria Gratuita
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="hidden md:block">
                                        <FileCheck size={80} className="text-emerald-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

const CheckItem = ({ title, desc }: { title: string, desc: string }) => (
    <div className="flex gap-4 p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors bg-white">
        <div className="mt-1">
            <CheckSquare className="w-6 h-6 text-green-600" />
        </div>
        <div>
            <h4 className="font-bold text-slate-900 text-lg">{title}</h4>
            <p className="text-slate-600 text-sm mt-1">{desc}</p>
        </div>
    </div>
);

export default ChecklistNR01Artigo;
