import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

import { createBreadcrumbSchema } from '../../lib/seo/schemas';

const BlogPage = () => {
    const breadcrumb = createBreadcrumbSchema([
        { name: 'Home', url: 'https://www.humaniqai.com.br' },
        { name: 'Blog', url: 'https://www.humaniqai.com.br/blog' }
    ]);

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Blog HumaniQ AI | Saúde Mental e Compliance NR-01"
                description="Artigos, dicas e novidades sobre saúde mental no trabalho, riscos psicossociais, NR-01 e gestão de pessoas."
                canonicalUrl="/blog"
                schema={breadcrumb}
            />

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <h1 className="text-4xl font-bold mb-2 text-slate-900">Blog HumaniQ AI: Saúde Mental, NR-01 e Inovação em RH</h1>
                <p className="text-xl text-slate-600 mb-6">Conteúdos sobre saúde mental corporativa e legislação.</p>
                <div className="flex flex-wrap gap-4 mb-12 text-sm font-medium items-center bg-slate-50 p-4 rounded-lg inline-flex border border-slate-100">
                    <span className="text-slate-500 uppercase text-xs tracking-wider font-bold">Guias Recomendados:</span>
                    <Link to="/nr01" className="text-blue-600 hover:underline flex items-center">
                        NR-01 Completa
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link to="/riscos-psicossociais" className="text-blue-600 hover:underline flex items-center">
                        Riscos Psicossociais
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Placeholder Post 1 */}
                    <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <img src="/images/blog/nr01-post.png" alt="NR-01 Compliance" className="h-48 w-full object-contain bg-slate-100" />
                        <div className="p-6">
                            <div className="text-xs font-semibold text-blue-600 uppercase mb-2">NR-01</div>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">Como adequar sua empresa à NR-01 em 2026</h2>
                            <p className="text-slate-600 mb-4 line-clamp-3">Guia completo com o passo a passo para garantir que sua empresa esteja 100% em conformidade com as novas exigências da norma.</p>
                            <Link to="/blog/nr01-2026" className="text-blue-600 font-medium hover:underline">Ler mais →</Link>
                        </div>
                    </article>

                    {/* Placeholder Post 2 */}
                    <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <img src="/images/blog/mapeamento-post.png" alt="Mapeamento Psicossocial" className="h-48 w-full object-contain bg-slate-100" />
                        <div className="p-6">
                            <div className="text-xs font-semibold text-green-600 uppercase mb-2">Saúde Mental</div>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">Sinais de Burnout na equipe: Como identificar?</h2>
                            <p className="text-slate-600 mb-4 line-clamp-3">Aprenda a reconhecer os primeiros sinais de esgotamento profissional nos seus colaboradores e como intervir precocemente.</p>
                            <Link to="/blog/sinais-burnout" className="text-blue-600 font-medium hover:underline">Ler mais →</Link>
                        </div>
                    </article>

                    {/* Placeholder Post 3 */}
                    <article className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <img src="/images/blog/ia-gestao-post.png" alt="IA na Gestão de Pessoas" className="h-48 w-full object-contain bg-slate-100" />
                        <div className="p-6">
                            <div className="text-xs font-semibold text-purple-600 uppercase mb-2">Tecnologia</div>
                            <h2 className="text-xl font-bold mb-3 text-slate-900">IA na Gestão de Pessoas: O futuro chegou</h2>
                            <p className="text-slate-600 mb-4 line-clamp-3">Como a inteligência artificial está revolucionando a forma como o RH cuida do ativo mais precioso das empresas: as pessoas.</p>
                            <Link to="/blog/ia-gestao-pessoas" className="text-blue-600 font-medium hover:underline">Ler mais →</Link>
                        </div>
                    </article>
                </div>

                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold mb-4">Quer receber novidades?</h3>
                    <p className="mb-6">Assine nossa newsletter e fique por dentro das atualizações legais e melhores práticas.</p>
                    <div className="flex max-w-md mx-auto gap-2">
                        <input type="email" placeholder="Seu e-mail corporativo" className="flex-1 px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <Button>Inscrever</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
