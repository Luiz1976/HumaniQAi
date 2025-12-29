import React from 'react';
import { SeoHead } from '../../../components/seo/SeoHead';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { createBreadcrumbSchema } from '../../../lib/seo/schemas';

const NR01Artigo = () => {
    const breadcrumb = createBreadcrumbSchema([
        { name: 'Home', url: 'https://www.humaniqai.com.br' },
        { name: 'Blog', url: 'https://www.humaniqai.com.br/blog' },
        { name: 'NR-01 e Compliance 2026', url: 'https://www.humaniqai.com.br/blog/nr01-2026' }
    ]);

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Como adequar sua empresa à NR-01 em 2026 | Blog HumaniQ AI"
                description="Guia completo com o passo a passo para garantir que sua empresa esteja 100% em conformidade com as novas exigências da norma."
                canonicalUrl="/blog/nr01-2026"
                schema={breadcrumb}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Blog
                </Link>

                <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <img src="/images/blog/nr01-post.png" alt="NR-01 Compliance" className="w-full h-64 object-contain bg-slate-100" />

                    <div className="p-8">
                        <div className="text-xs font-semibold text-blue-600 uppercase mb-2">NR-01</div>
                        <h1 className="text-4xl font-bold mb-4 text-slate-900">Como adequar sua empresa à NR-01 em 2026</h1>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg text-slate-600 mb-6">
                                A Norma Regulamentadora 01 (NR-01) estabelece disposições gerais sobre saúde e segurança no trabalho.
                                Com as atualizações previstas para 2026, as empresas precisam se preparar para atender às novas exigências.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">O que muda em 2026?</h2>
                            <p className="text-slate-700 mb-4">
                                As mudanças na NR-01 trazem maior ênfase na gestão de riscos psicossociais e na saúde mental dos trabalhadores.
                                As empresas precisarão:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Implementar programas estruturados de identificação e gestão de riscos psicossociais</li>
                                <li>Realizar mapeamentos periódicos do ambiente organizacional</li>
                                <li>Documentar todas as ações preventivas e corretivas</li>
                                <li>Treinar gestores e RH para identificação precoce de problemas</li>
                                <li>Criar canais de comunicação seguros para relatos de assédio e burnout</li>
                            </ul>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Passo a passo para adequação</h2>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">1. Diagnóstico inicial</h3>
                            <p className="text-slate-700 mb-4">
                                Realize um mapeamento completo dos riscos psicossociais presentes na sua organização.
                                Utilize ferramentas validadas de avaliação como questionários de clima organizacional e testes de burnout.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">2. Elaboração do plano de ação</h3>
                            <p className="text-slate-700 mb-4">
                                Com base no diagnóstico, desenvolva um plano detalhado de ações preventivas e corretivas.
                                Priorize os riscos mais críticos e estabeleça prazos claros para implementação.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">3. Capacitação da equipe</h3>
                            <p className="text-slate-700 mb-4">
                                Treine gestores, equipes de RH e membros da CIPA sobre os novos requisitos.
                                É fundamental que todos compreendam a importância da saúde mental no ambiente de trabalho.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">4. Implementação de ferramentas</h3>
                            <p className="text-slate-700 mb-4">
                                Adote soluções tecnológicas que facilitem a gestão e o monitoramento contínuo.
                                Plataformas como a HumaniQ AI permitem automatizar processos de avaliação e gerar relatórios em conformidade com a legislação.
                            </p>

                            <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-800">5. Documentação e registros</h3>
                            <p className="text-slate-700 mb-4">
                                Mantenha toda a documentação organizada e atualizada. Isso inclui avaliações, planos de ação,
                                atas de reuniões e registros de treinamentos.
                            </p>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Como a HumaniQ AI pode ajudar</h2>
                            <p className="text-slate-700 mb-4">
                                Nossa plataforma oferece uma solução completa para adequação à NR-01:
                            </p>
                            <ul className="list-disc pl-6 mb-6 text-slate-700 space-y-2">
                                <li>Mapeamento automatizado de riscos psicossociais</li>
                                <li>Questionários validados e padronizados</li>
                                <li>Relatórios em conformidade com a legislação</li>
                                <li>Dashboard de acompanhamento em tempo real</li>
                                <li>Histórico completo de avaliações</li>
                            </ul>

                            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
                                <p className="text-blue-900 font-semibold mb-2">💡 Dica importante</p>
                                <p className="text-blue-800">
                                    Não deixe para a última hora! Comece o processo de adequação o quanto antes para evitar
                                    multas e garantir um ambiente de trabalho mais saudável para sua equipe.
                                </p>
                            </div>

                            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">Conclusão</h2>
                            <p className="text-slate-700 mb-4">
                                A adequação à NR-01 não é apenas uma obrigação legal, mas uma oportunidade de melhorar
                                o ambiente de trabalho e o bem-estar dos colaboradores. Empresas que investem em saúde mental
                                apresentam maior produtividade, menor rotatividade e um clima organizacional mais positivo.
                            </p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex gap-4">
                                <Link to="/quick-check">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Fazer Teste Gratuito
                                    </Button>
                                </Link>
                                <a href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma demonstração da plataforma HumaniQ AI" target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                        Agendar Demonstração
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default NR01Artigo;
