/**
 * Schema.org structured data for SEO
 * Usado para rich results no Google e outros search engines
 */

export interface SchemaOrganization {
    "@context": "https://schema.org";
    "@type": "Organization";
    name: string;
    url: string;
    logo: string;
    description: string;
    address?: {
        "@type": "PostalAddress";
        addressCountry: string;
        addressLocality?: string;
        addressRegion?: string;
    };
    contactPoint?: {
        "@type": "ContactPoint";
        contactType: string;
        email?: string;
        availableLanguage: string[];
    };
    sameAs?: string[];
}

export interface SchemaSoftwareApplication {
    "@context": "https://schema.org";
    "@type": "SoftwareApplication";
    name: string;
    applicationCategory: string;
    operatingSystem: string;
    offers: {
        "@type": "Offer";
        price: string;
        priceCurrency: string;
    };
    description: string;
    featureList?: string[];
    screenshot?: string;
}

export interface SchemaWebSite {
    "@context": "https://schema.org";
    "@type": "WebSite";
    name: string;
    url: string;
}

export interface SchemaArticle {
    "@context": "https://schema.org";
    "@type": "Article";
    headline: string;
    description: string;
    author: {
        "@type": "Organization";
        name: string;
    };
    publisher: {
        "@type": "Organization";
        name: string;
        logo: {
            "@type": "ImageObject";
            url: string;
        };
    };
    datePublished?: string;
    dateModified?: string;
    image?: string;
}

export interface SchemaFAQPage {
    "@context": "https://schema.org";
    "@type": "FAQPage";
    mainEntity: Array<{
        "@type": "Question";
        name: string;
        acceptedAnswer: {
            "@type": "Answer";
            text: string;
        };
    }>;
}

/**
 * Schema.org Organization para HumaniQ AI
 */
export const organizationSchema: SchemaOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HumaniQ AI",
    url: "https://www.humaniqai.com.br",
    logo: "https://www.humaniqai.com.br/LOGO%20TRANSPARENTE.png",
    description: "Software completo para gestão de riscos psicossociais e compliance NR-01. Plataforma integrada com mapeamento automatizado, avaliação individual, relatórios técnicos e capacitação de lideranças.",
    address: {
        "@type": "PostalAddress",
        addressCountry: "BR"
    },
    contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "contato@humaniqai.com.br",
        availableLanguage: ["pt-BR"]
    }
};

/**
 * Schema.org SoftwareApplication para a plataforma HumaniQ AI
 */
export const softwareApplicationSchema: SchemaSoftwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HumaniQ AI - Plataforma de Gestão de Riscos Psicossociais",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
        "@type": "Offer",
        price: "35.00",
        priceCurrency: "BRL"
    },
    description: "Software completo para gestão de riscos psicossociais conforme NR-01. Inclui mapeamento online automatizado, avaliação individual com sigilo, dashboard de saúde psicossocial, relatórios automáticos, PGR específico NR-01, propostas de ação inteligentes com IA, melhoria contínua, treinamento EAD para lideranças e histórico auditável completo.",
    featureList: [
        "Mapeamento Online Automatizado de Riscos Psicossociais",
        "Avaliação Individual com Sigilo LGPD",
        "Dashboard de Saúde Psicossocial em Tempo Real",
        "Relatórios Automáticos para Auditoria MTE",
        "Relatório PGR Específico NR-01",
        "Propostas de Ação Inteligentes com IA",
        "Sistema de Melhoria Contínua PDCA",
        "Treinamento EAD para Lideranças com Certificação",
        "Histórico Auditável Completo"
    ]
};

/**
 * Schema.org WebSite para HumaniQ AI
 */
export const websiteSchema: SchemaWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HumaniQ AI",
    url: "https://www.humaniqai.com.br"
};

/**
 * Gera schema Article para páginas de conteúdo
 */
export function createArticleSchema(
    headline: string,
    description: string,
    datePublished?: string,
    dateModified?: string,
    image?: string
): SchemaArticle {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        author: {
            "@type": "Organization",
            name: "HumaniQ AI"
        },
        publisher: {
            "@type": "Organization",
            name: "HumaniQ AI",
            logo: {
                "@type": "ImageObject",
                url: "https://www.humaniqai.com.br/LOGO%20TRANSPARENTE.png"
            }
        },
        datePublished,
        dateModified,
        image
    };
}

/**
 * Gera schema FAQPage
 */
export function createFAQSchema(
    questions: Array<{ question: string; answer: string }>
): SchemaFAQPage {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map(q => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: q.answer
            }
        }))
    };
}
