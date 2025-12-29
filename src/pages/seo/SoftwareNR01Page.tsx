import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import { Button } from '../../components/ui/button';
import { Link } from 'react-router-dom';

import { createBreadcrumbSchema } from '../../lib/seo/schemas';

const SoftwareNR01Page = () => {
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "HumaniQ AI - Software NR-01",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "35.00",
            "priceCurrency": "BRL",
            "unitText": "PER_USER" // Aproximado para "por colaborador"
        },
        "description": "Software especializado para gestão de riscos psicossociais e conformidade com a NR-01."
    };

    const breadcrumbSchema = createBreadcrumbSchema([
        { name: 'Home', url: 'https://www.humaniqai.com.br' },
        { name: 'Software NR-01', url: 'https://www.humaniqai.com.br/software-nr01' }
    ]);

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Software para NR-01 e Saúde Mental | HumaniQ AI"
                description="O melhor software para gestão da NR-01 e riscos psicossociais. Automatize avaliações, gere relatórios para o PGR e garanta conformidade."
                canonicalUrl="/software-nr01"
                schema={[softwareSchema, breadcrumbSchema]}
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6 text-slate-900">Software para Gestão da NR-01</h1>

                <div className="prose prose-lg max-w-none text-slate-700">
                    <p className="lead text-xl mb-8">
                        Digitalize o processo de adequação à NR-01 com o software da HumaniQ AI. Centralize avaliações,
                        documentos e planos de ação em uma única plataforma segura e intuitiva.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 my-10">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-3 text-blue-600">Automação de Testes</h3>
                            <p>Envie avaliações de clima e psicossociais automaticamente por e-mail ou link, sem planilhas manuais.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-3 text-blue-600">Relatórios para PGR</h3>
                            <p>Gere relatórios técnicos prontos para integrar ao Programa de Gerenciamento de Riscos da sua empresa.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-3 text-blue-600">Dashboard em Tempo Real</h3>
                            <p>Acompanhe indicadores de saúde mental e adesão dos colaboradores em tempo real.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-3 text-blue-600">Segurança de Dados</h3>
                            <p>Plataforma em conformidade com a LGPD e rigorosos padrões de segurança da informação.</p>
                        </div>
                    </div>

                </div>

                <div className="mt-12 text-center">
                    <h2 className="text-3xl font-bold mb-6">Experimente o Software Líder em Saúde Corporativa</h2>
                    <Link to="/quick-check">
                        <Button size="lg" className="text-lg px-8 py-6 h-auto">
                            Fazer Teste Gratuito
                        </Button>
                    </Link>
                    <p className="mt-4 text-sm text-gray-500">Sem compromisso. Cancele quando quiser.</p>
                </div>
            </div>
        </div>
    );
};

export default SoftwareNR01Page;
