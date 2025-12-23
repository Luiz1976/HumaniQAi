import fs from 'fs/promises';
import path from 'path';
import { build } from 'vite';
import type { Plugin } from 'vite';

interface PrerenderRoute {
    path: string;
    title?: string;
    description?: string;
}

const routes: PrerenderRoute[] = [
    {
        path: '/',
        title: 'HumaniQ AI | Software de Gestão de Riscos Psicossociais conforme NR-01',
        description: 'Software completo para gestão de riscos psicossociais e compliance NR-01.'
    },
    {
        path: '/blog',
        title: 'Blog HumaniQ AI | Saúde Mental e Compliance NR-01',
        description: 'Artigos, dicas e novidades sobre saúde mental no trabalho.'
    },
    {
        path: '/nr01',
        title: 'NR-01 | Riscos Psicossociais | HumaniQ AI',
        description: 'Tudo sobre NR-01 e gestão de riscos psicossociais no trabalho.'
    },
    {
        path: '/riscos-psicossociais',
        title: 'Riscos Psicossociais no Trabalho | HumaniQ AI',
        description: 'Entenda os riscos psicossociais e como gerenciá-los.'
    },
    {
        path: '/software-nr01',
        title: 'Software NR-01 | Plataforma de Compliance | HumaniQ AI',
        description: 'Software especializado em compliance com a NR-01.'
    },
    {
        path: '/faq',
        title: 'FAQ | Perguntas Frequentes | HumaniQ AI',
        description: 'Tire suas dúvidas sobre riscos psicossociais e NR-01.'
    }
];

/**
 * Plugin Vite para pré-renderizar rotas estáticas
 * Injeta conteúdo SEO diretamente no HTML base
 */
export function vitePrerender(): Plugin {
    return {
        name: 'vite-simple-prerender',
        transformIndexHtml: {
            order: 'post',
            handler(html, ctx) {
                // Encontrar rota correspondente
                const route = routes.find(r => {
                    const urlPath = ctx.path === '/index.html' ? '/' : ctx.path.replace('/index.html', '');
                    return r.path === urlPath;
                });

                if (!route) return html;

                // Injetar meta tags dinâmicas no <head>
                let processedHtml = html;

                // Atualizar title se diferente do padrão
                if (route.title) {
                    processedHtml = processedHtml.replace(
                        /<title>.*?<\/title>/,
                        `<title>${route.title}</title>`
                    );
                }

                // Atualizar description se disponível
                if (route.description) {
                    processedHtml = processedHtml.replace(
                        /<meta name="description" content=".*?"\/>/,
                        `<meta name="description" content="${route.description}" />`
                    );
                }

                // Adicionar conteúdo SEO básico no body (fallback para crawlers antigos)
                // Isto garante que mesmo sem JS, há conteúdo textual
                const seoFallback = `
          <div style="position:absolute;left:-9999px;top:-9999px;">
            <h1>${route.title || 'HumaniQ AI'}</h1>
            <p>${route.description || ''}</p>
          </div>
        `;

                processedHtml = processedHtml.replace(
                    '<div id="root"></div>',
                    `<div id="root"></div>${seoFallback}`
                );

                return processedHtml;
            }
        }
    };
}
