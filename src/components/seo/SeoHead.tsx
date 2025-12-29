import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
    title: string;
    description: string;
    canonicalUrl?: string;
    ogType?: 'website' | 'article' | 'profile';
    ogImage?: string;
    schema?: Record<string, any> | Record<string, any>[];
}

export const SeoHead: React.FC<SeoHeadProps> = ({
    title,
    description,
    canonicalUrl,
    ogType = 'website',
    ogImage = '/og-image.png',
    schema
}) => {
    const siteUrl = 'https://www.humaniqai.com.br';
    const fullCanonicalUrl = canonicalUrl
        ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${siteUrl}${canonicalUrl}`)
        : window.location.href;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullCanonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullCanonicalUrl} />
            <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />

            {/* Schema.org JSON-LD */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};
