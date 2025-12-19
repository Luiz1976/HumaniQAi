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
                title="NR-01 e Riscos Psicossociais | Plataforma HumaniQ AI"
                description="Avalie riscos psicossociais conforme a NR-01 com a HumaniQ AI. Plataforma automática, relatórios inteligentes e conformidade legal."
                canonicalUrl="/nr01"
                schema={schema}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-slate-900">NR-01 e Riscos Psicossociais</h1>

                <div className="prose prose-lg max-w-none text-slate-700">
                    <p className="lead text-xl mb-8">
                        A Norma Regulamentadora 01 (NR-01) estabelece as disposições gerais sobre saúde e segurança no trabalho,
                        incluindo agora a obrigatoriedade de gerenciar riscos ocupacionais, entre eles, os riscos psicossociais.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">O que a NR-01 diz sobre riscos psicossociais?</h2>
                    <p>
                        Com as atualizações recentes, o Gerenciamento de Riscos Ocupacionais (GRO) deve englobar não apenas
                        riscos físicos, químicos e biológicos, mas também os fatores ergonômicos e psicossociais que afetam
                        a saúde mental dos colaboradores.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Principais pontos de atenção:</h3>
                    <ul className="list-disc pl-6 mb-6">
                        <li>Identificação de perigos relacionados à organização do trabalho.</li>
                        <li>Avaliação dos riscos à saúde mental (estresse, burnout, assédio).</li>
                        <li>Implementação de medidas de prevenção e controle.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Como a HumaniQ AI ajuda sua empresa?</h2>
                    <p className="mb-6">
                        Nossa plataforma utiliza inteligência artificial e protocolos validados cientificamente para mapear,
                        analisar e monitorar o clima organizacional e a saúde mental da sua equipe, garantindo conformidade
                        com a NR-01 e promovendo um ambiente de trabalho mais saudável.
                    </p>
                </div>

                <div className="mt-12 bg-slate-50 p-8 rounded-xl border border-slate-200 text-center">
                    <h3 className="text-2xl font-bold mb-4">Esteja em conformidade com a NR-01 hoje mesmo</h3>
                    <p className="mb-6 text-slate-600">
                        Comece agora a avaliação de riscos psicossociais da sua empresa com nossa solução completa.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/quick-check">
                            <Button size="lg" className="w-full sm:w-auto">
                                Fazer Teste Gratuito
                            </Button>
                        </Link>
                        <a href="https://api.whatsapp.com/send/?phone=5519983835867&text=Ol%C3%A1%2C+quero+agendar+uma+demonstra%C3%A7%C3%A3o+do+HumaniQ+AI.&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Agendar Demonstração
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NR01Page;
