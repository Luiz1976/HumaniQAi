import React from 'react';
import { SeoHead } from '../../../components/seo/SeoHead';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createBreadcrumbSchema, createBlogPostingSchema } from '../../../lib/seo/schemas';

const InventarioRiscosArtigo = () => {
    const breadcrumb = createBreadcrumbSchema([
        { name: 'Home', url: 'https://www.humaniqai.com.br' },
        { name: 'Blog', url: 'https://www.humaniqai.com.br/blog' },
        { name: 'Como Elaborar o Inventário de Riscos', url: 'https://www.humaniqai.com.br/blog/inventario-riscos-pgr' }
    ]);

    const articleSchema = createBlogPostingSchema(
        "Como Elaborar o Inventário de Riscos Psicossociais no PGR",
        "Passo a passo prático para incluir os fatores psicossociais no Inventário de Riscos do seu PGR, conforme exigido pela nova NR-01.",
        "https://www.humaniqai.com.br/images/blog/inventario-post.png",
        "2024-03-25",
        "2024-03-25",
        "https://www.humaniqai.com.br/blog/inventario-riscos-pgr"
    );

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Inventário de Riscos Psicossociais no PGR: Guia Prático | HumaniQ AI"
                description="Aprenda a documentar corretamente os riscos psicossociais no Inventário de Riscos do PGR. Evite erros comuns e garanta a conformidade com a NR-01."
                canonicalUrl="/blog/inventario-riscos-pgr"
                schema={[breadcrumb, articleSchema]}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Blog
                </Link>

                <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Placeholder image - em produção, substituir por imagem real */}
                    <div className="bg-slate-200 w-full h-64 flex items-center justify-center text-slate-400">
                        <span className="text-lg">Imagem: Inventário de Riscos</span>
                    </div>

                    <div className="p-8">
                        <div className="text-xs font-semibold text-green-600 uppercase mb-2">PGR & NR-01</div>
                        <h1 className="text-4xl font-bold mb-4 text-slate-900">Como Elaborar o Inventário de Riscos Psicossociais no PGR</h1>

                        <div className="flex items-center text-sm text-slate-500 mb-8">
                            <span>Por Equipe HumaniQ AI</span>
                            <span className="mx-2">•</span>
                            <span>Tempo de leitura: 5 min</span>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <p className="lead text-xl text-slate-700 mb-6">
                                O Inventário de Riscos é o coração do Programa de Gerenciamento de Riscos (PGR).
                                Com a nova NR-01, ele deve incluir obrigatoriamente os riscos psicossociais.
                                Mas como tangibilizar sentimentos e percepções em um documento técnico?
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">O que deve constar no Inventário?</h2>
                            <p>
                                Pela NR-01 (item 1.5.7.3.2), o inventário deve conter, no mínimo:
                            </p>
                            <ul className="list-disc pl-6 mb-6">
                                <li>Caracterização dos processos e ambientes de trabalho;</li>
                                <li>Caracterização das atividades;</li>
                                <li>Descrição de perigos e de possíveis lesões ou agravos à saúde;</li>
                                <li>Identificação das fontes ou circunstâncias;</li>
                                <li>Definição do grupo de trabalhadores expostos;</li>
                                <li>Avaliação dos riscos (nível de risco).</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Passo 1: Identificando a Fonte do Perigo</h2>
                            <p>
                                Não basta escrever "estresse". Você precisa identificar a <strong>fonte</strong>. Exemplos de fontes de risco psicossocial para o inventário:
                            </p>
                            <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-green-500 my-4">
                                <ul className="space-y-2">
                                    <li><strong>Sobrecarga de trabalho:</strong> Excesso de tarefas para o tempo disponível.</li>
                                    <li><strong>Ambiguidade de papéis:</strong> O trabalhador não sabe exatamente o que se espera dele.</li>
                                    <li><strong>Falta de autonomia:</strong> Impossibilidade de influenciar na forma como o trabalho é feito.</li>
                                    <li><strong>Assédio moral:</strong> Comportamentos abusivos e repetitivos.</li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Passo 2: Definindo a Probabilidade e Severidade</h2>
                            <p>
                                Para classificar o nível do risco, você precisa cruzar Probabilidade x Severidade.
                                Para riscos psicossociais, a <strong>HumaniQ AI</strong> utiliza escalas validadas cientificamente:
                            </p>
                            <ul className="list-disc pl-6 mb-6">
                                <li><strong>Probabilidade:</strong> Baseada na frequência da exposição (diária, semanal, eventual) e na percepção coletiva (coletada via questionários).</li>
                                <li><strong>Severidade:</strong> Baseada no potencial de dano (afastamento temporário, doença crônica, invalidez).</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Passo 3: Vinculando ao Plano de Ação</h2>
                            <p>
                                Um erro comum é criar o inventário e não fazer nada com ele. Cada risco classificado como "Moderado", "Substancial" ou "Intolerável" deve ter uma ação de controle vinculada no Plano de Ação.
                            </p>
                            <p>
                                Exemplo: Se foi identificado "Alto Risco" para "Falta de Autonomia", uma ação correspondente pode ser "Redesenho do job description e treinamento de liderança participativa".
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Automatize seu Inventário</h2>
                            <p>
                                Fazer isso manualmente em planilhas Excel é propenso a erros e difícil de atualizar (o PGR é um documento vivo!).
                                O software da HumaniQ AI gera o Capítulo de Riscos Psicossociais do seu Inventário automaticamente, baseado nas respostas reais dos colaboradores.
                            </p>
                        </div>

                        <div className="mt-12 bg-indigo-50 p-8 rounded-xl border border-indigo-100 text-center">
                            <h3 className="text-2xl font-bold mb-4 text-indigo-900">Gere seu PGR Psicossocial em Minutos</h3>
                            <p className="mb-6 text-indigo-800">
                                Nossa IA analisa os dados e monta a matriz de risco pronta para o auditor.
                            </p>
                            <Link to="/quick-check">
                                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 font-bold">
                                    Testar Plataforma Gratuitamente
                                </Button>
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default InventarioRiscosArtigo;
