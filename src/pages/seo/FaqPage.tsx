import React from 'react';
import { SeoHead } from '../../components/seo/SeoHead';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FaqPage = () => {
    const faqs = [
        // --- NR-01 e Conceitos Gerais ---
        {
            category: "Conceitos Gerais e NR-01",
            question: "O que é a NR-01 e por que ela mudou?",
            answer: "A NR-01 (Norma Regulamentadora nº 01) estabelece as disposições gerais sobre saúde e segurança no trabalho. Sua atualização recente instituiu o Gerenciamento de Riscos Ocupacionais (GRO) e a obrigatoriedade do PGR (Programa de Gerenciamento de Riscos), dando ênfase inédita aos riscos psicossociais."
        },
        {
            category: "Conceitos Gerais e NR-01",
            question: "O que são riscos psicossociais ocupacionais?",
            answer: "São fatores decorrentes da organização e gestão do trabalho que podem causar danos à saúde mental e física do trabalhador. Exemplos: sobrecarga de trabalho, assédio moral, falta de autonomia, metas inatingíveis e conflitos interpessoais."
        },
        {
            category: "Conceitos Gerais e NR-01",
            question: "Todas as empresas precisam cumprir a NR-01?",
            answer: "Sim. A NR-01 é obrigatória para todas as organizações que possuem empregados regidos pela CLT, independente do porte ou grau de risco da atividade."
        },
        {
            category: "Conceitos Gerais e NR-01",
            question: "MEI precisa fazer PGR de riscos psicossociais?",
            answer: "MEI está dispensado de elaborar PGR se não tiver exposição a riscos físicos, químicos ou biológicos, mas deve preencher as fichas de MEI. No entanto, se houver funcionário, a gestão dos riscos psicossociais é recomendada para evitar passivos trabalhistas."
        },
        {
            category: "Conceitos Gerais e NR-01",
            question: "Qual a diferença entre PGR e PPRA?",
            answer: "O PPRA (antigo) focava apenas em riscos ambientais (físicos, químicos e biológicos). O PGR é mais abrangente e DEVE incluir riscos ergonômicos e de acidentes, além dos psicossociais, integrando-se com o PCMSO."
        },
        {
            category: "Conceitos Gerais e NR-01",
            question: "O que é a Síndrome de Burnout segundo a lei?",
            answer: "Desde 2022, o Burnout é classificado pela OMS e reconhecido no Brasil como doença ocupacional equiparada a acidente de trabalho, gerando estabilidade de 12 meses ao funcionário após retorno do afastamento."
        },

        // --- Multas e Fiscalização ---
        {
            category: "Multas e Fiscalização",
            question: "Qual o valor da multa por não avaliar riscos psicossociais?",
            answer: "As multas variam conforme o número de empregados e o tipo de infração, podendo ir de R$ 1.799,00 a R$ 6.708,00 por item irregular. A reincidência ou tentativa de fraude agrava o valor."
        },
        {
            category: "Multas e Fiscalização",
            question: "Como funciona a fiscalização do MTE?",
            answer: "A fiscalização pode ser presencial ou eletrônica (via eSocial). Os auditores verificam a coerência entre o Inventário de Riscos, o Plano de Ação e os Atestados de Saúde Ocupacional (ASO)."
        },
        {
            category: "Multas e Fiscalização",
            question: "O que acontece se um funcionário processar a empresa por Burnout?",
            answer: "A empresa precisará provar documentalmente que identificou os riscos e tomou medidas preventivas. Sem o PGR atualizado e evidências de gestão (provas), a condenação é quase certa, podendo atingir centenas de milhares de reais."
        },
        {
            category: "Multas e Fiscalização",
            question: "A CIPA tem papel na gestão de riscos psicossociais?",
            answer: "Sim. A nova legislação (Lei 14.457/22) exige que a CIPA promova ações de combate ao assédio sexual e moral, o que está diretamente ligado aos riscos psicossociais."
        },

        // --- Metodologia e Avaliação ---
        {
            category: "Metodologia e Avaliação",
            question: "Como medir um risco que é 'invisível' (psicossocial)?",
            answer: "Utilizam-se escalas psicométricas validadas cientificamente (como ECOS, JSS, SRQ-20) aplicadas aos colaboradores para quantificar a percepção de estresse, suporte social e demanda de trabalho."
        },
        {
            category: "Metodologia e Avaliação",
            question: "Posso criar meu próprio questionário no Google Forms?",
            answer: "Não é recomendado. Questionários caseiros não têm validade científica ou jurídica. Além disso, o Google Forms não garante o anonimato adequado exigido para temas sensíveis."
        },
        {
            category: "Metodologia e Avaliação",
            question: "O colaborador é obrigado a responder à avaliação?",
            answer: "Não, a participação deve ser voluntária. Porém, com uma boa campanha de comunicação garantindo o sigilo, a adesão costuma ser alta."
        },
        {
            category: "Metodologia e Avaliação",
            question: "Com que frequência devo avaliar os riscos psicossociais?",
            answer: "A recomendação é anual, ou sempre que houver mudanças significativas na organização, ou quando o PCMSO indicar aumento de afastamentos por saúde mental."
        },
        {
            category: "Metodologia e Avaliação",
            question: "O resultado da avaliação é individual ou coletivo?",
            answer: "Para a empresa, o resultado é sempre coletivo (por setor ou grupo), preservando a identidade. O colaborador pode receber um feedback individual confidencial, dependendo da ferramenta."
        },
        {
            category: "Metodologia e Avaliação",
            question: "O que é Inventário de Riscos?",
            answer: "É o documento que lista todos os perigos identificados, quem está exposto, a classificação do risco (probabilidade x severidade) e as medidas de controle existentes."
        },

        // --- Software HumaniQ AI ---
        {
            category: "Plataforma HumaniQ AI",
            question: "O HumaniQ AI substitui o engenheiro de segurança?",
            answer: "Não. O software é uma ferramenta para instrumentalizar o engenheiro, o médico do trabalho e o RH. Ele automatiza a coleta e tabulação de dados, mas a análise crítica e assinatura do PGR são técnicas."
        },
        {
            category: "Plataforma HumaniQ AI",
            question: "Os dados dos colaboradores estão seguros (LGPD)?",
            answer: "Sim. O HumaniQ AI foi desenhado seguindo princípios de Privacy by Design. Os dados de saúde são criptografados e o acesso é restrito, garantindo total conformidade com a LGPD."
        },
        {
            category: "Plataforma HumaniQ AI",
            question: "O software gera o documento do PGR pronto?",
            answer: "Sim, o sistema gera o capítulo de Riscos Psicossociais do PGR em PDF, pronto para ser anexado ao documento geral da empresa, com todas as tabelas e matrizes de risco."
        },
        {
            category: "Plataforma HumaniQ AI",
            question: "Como os colaboradores acessam a avaliação?",
            answer: "Eles recebem um link único por e-mail ou WhatsApp (ou QR Code na empresa) para responder às perguntas em qualquer dispositivo (celular ou computador)."
        },
        {
            category: "Plataforma HumaniQ AI",
            question: "O sistema sugere planos de ação?",
            answer: "Sim. Nossa Inteligência Artificial analisa os resultados e sugere um banco de ações corretivas específicas para os problemas detectados (ex: ações para melhorar o suporte da liderança)."
        },
        {
            category: "Plataforma HumaniQ AI",
            question: "É possível comparar resultados entre departamentos?",
            answer: "Sim. O dashboard permite segmentar os riscos por setor, cargo, unidade ou turno, facilitando intervenções cirúrgicas onde o problema é maior."
        },
        {
            category: "Plataforma HumaniQ AI",
            question: "A plataforma oferece treinamentos?",
            answer: "Sim, possuímos módulos de EAD integrados para capacitação de lideranças e colaboradores sobre saúde mental e assédio, com emissão automática de certificados."
        },

        // --- Comercial e Suporte ---
        {
            category: "Comercial e Suporte",
            question: "Quanto tempo demora para implementar?",
            answer: "O setup é imediato. Em menos de 24h é possível cadastrar os setores e disparar as avaliações para os colaboradores."
        },
        {
            category: "Comercial e Suporte",
            question: "Posso testar antes de comprar?",
            answer: "Sim! Oferecemos um trial gratuito que permite avaliar um setor da sua empresa e gerar um relatório preliminar."
        },
        {
            category: "Comercial e Suporte",
            question: "Como funciona o suporte?",
            answer: "Oferecemos suporte via chat, e-mail e WhatsApp em horário comercial, além de uma base de conhecimento completa com vídeos tutoriais."
        },
        {
            category: "Comercial e Suporte",
            question: "Atendem consultorias de SST?",
            answer: "Sim. Temos um plano 'Parceiro' específico para consultorias que desejam usar o HumaniQ AI para atender seus próprios clientes, com gestão multi-inquilino."
        },
        {
            category: "Comercial e Suporte",
            question: "Quais são as formas de pagamento?",
            answer: "Boleto bancário, PIX ou cartão de crédito corporativo, com faturamento mensal ou anual (com desconto)."
        },
        {
            category: "Comercial e Suporte",
            question: "Há fidelidade no contrato?",
            answer: "Nos planos mensais, não há fidelidade. Você pode cancelar a qualquer momento. Nos planos anuais, há condições especiais."
        },
        {
            category: "Comercial e Suporte",
            question: "A ferramenta emite certificado para os alunos dos cursos?",
            answer: "Sim, todos os cursos de capacitação da plataforma geram certificados nominais válidos como evidência de treinamento para a fiscalização."
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
                title="Perguntas Frequentes (FAQ) | Gestão de Riscos NR-01"
                description="Tire todas as suas dúvidas sobre a NR-01, gestão de riscos psicossociais, multas, prazos e como o software HumaniQ AI pode blindar sua empresa."
                canonicalUrl="/faq"
                schema={schema}
            />

            <div className="bg-slate-900 py-16 text-center px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Perguntas Frequentes</h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                    Tudo o que você precisa saber sobre a conformidade com a NR-01 e a gestão de riscos psicossociais em 2026.
                </p>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Search / Filter could go here */}

                <div className="grid gap-8">
                    {/* Group by category logic or just map all if creating sections */}

                    {["Conceitos Gerais e NR-01", "Multas e Fiscalização", "Metodologia e Avaliação", "Plataforma HumaniQ AI", "Comercial e Suporte"].map((category) => (
                        <div key={category} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2">{category}</h2>
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.filter(f => f.category === category).map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${category}-${index}`}>
                                        <AccordionTrigger className="text-left font-semibold text-slate-800 text-lg hover:text-blue-600 transition-colors">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-slate-600 text-base leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
                    <h3 className="text-2xl font-bold mb-4 text-slate-900">Ainda tem dúvidas?</h3>
                    <p className="mb-8 text-slate-600">
                        Nossa equipe de especialistas está pronta para orientar sua empresa na jornada de conformidade.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/contato">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Falar com Consultor</Button>
                        </Link>
                        <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg">Chamar no WhatsApp</Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
