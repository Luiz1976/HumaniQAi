import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FaqPage = () => {
    const faqs = [
        {
            question: "O que é a NR-01?",
            answer: "A Norma Regulamentadora 01 (NR-01) estabelece as disposições gerais sobre saúde e segurança no trabalho, gerenciamento de riscos ocupacionais e medidas de prevenção."
        },
        {
            question: "Riscos psicossociais são obrigatórios no PGR?",
            answer: "Sim. Com a atualização da NR-01, o gerenciamento de riscos ocupacionais (GRO) deve considerar todos os perigos e riscos, incluindo os fatores psicossociais e ergonômicos."
        },
        {
            question: "Como a HumaniQ AI ajuda na conformidade?",
            answer: "A HumaniQ AI fornece uma plataforma automatizada para avaliação, monitoramento e gestão de riscos psicossociais, gerando os dados e relatórios necessários para compor o seu PGR."
        },
        {
            question: "Quanto custa a plataforma?",
            answer: "Temos planos a partir de R$ 35,00 por colaborador, com opções flexíveis para empresas de diferentes portes. Oferecemos também um período de teste gratuito."
        },
        {
            question: "A avaliação é anônima?",
            answer: "Sim, garantimos o sigilo e anonimato das respostas individuais dos colaboradores para assegurar a veracidade dos dados e a segurança psicológica da equipe."
        }
    ];

    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-background">
            <SeoHead
                title="Perguntas Frequentes (FAQ) | HumaniQ AI"
                description="Tire suas dúvidas sobre NR-01, riscos psicossociais e como a plataforma HumaniQ AI pode ajudar sua empresa na gestão de saúde mental."
                canonicalUrl="/faq"
                schema={schema}
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-slate-900">Perguntas Frequentes</h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-semibold text-slate-800">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-slate-600">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
