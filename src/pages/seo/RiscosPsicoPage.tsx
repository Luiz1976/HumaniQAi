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

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Avaliação de Riscos Psicossociais | Ferramenta Online HumaniQ AI"
                description="Realize a avaliação de riscos psicossociais da sua empresa de forma digital e automática. Relatórios detalhados e planos de ação."
                canonicalUrl="/avaliacao-psicossocial"
                schema={schema}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-slate-900">Avaliação de Riscos Psicossociais</h1>

                <div className="prose prose-lg max-w-none text-slate-700">
                    <p className="lead text-xl mb-8">
                        Identificar e mitigar riscos psicossociais é fundamental para a saúde dos colaboradores e para a
                        produtividade da empresa. A Avaliação de Riscos Psicossociais da HumaniQ AI oferece uma visão
                        clara e acionável do ambiente de trabalho.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">O que é a Avaliação Psicossocial?</h2>
                    <p>
                        É um processo sistemático de coleta e análise de dados sobre fatores organizacionais, relacionais
                        e individuais que podem impactar a saúde mental e física dos trabalhadores. Fatores como carga de
                        trabalho excessiva, falta de autonomia, assédio e insegurança no emprego são analisados.
                    </p>

                    <h3 className="text-xl font-semibold mt-6 mb-3">Nossos diferenciais:</h3>
                    <ul className="list-disc pl-6 mb-6">
                        <li><strong>Protocolos Validados:</strong> Utilizamos metodologias reconhecidas (como COPSOQ, Karasek).</li>
                        <li><strong>Anonimato Garantido:</strong> Segurança total para os colaboradores responderem com sinceridade.</li>
                        <li><strong>Insights via IA:</strong> Nossa inteligência artificial analisa padrões e sugere intervenções.</li>
                    </ul>
                </div>

                <div className="mt-12 bg-blue-50 p-8 rounded-xl border border-blue-100 text-center">
                    <h3 className="text-2xl font-bold mb-4">Proteja sua equipe e sua empresa</h3>
                    <p className="mb-6 text-slate-600">
                        Planos acessíveis a partir de R$ 35,00 por colaborador para gestão completa.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/quick-check">
                            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                Assinar Agora
                            </Button>
                        </Link>
                        <a href="https://api.whatsapp.com/send/?phone=5519983835867&text=Ol%C3%A1%2C+quero+agendar+uma+demonstra%C3%A7%C3%A3o+do+HumaniQ+AI.&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                Falar com Especialista
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiscosPsicoPage;
