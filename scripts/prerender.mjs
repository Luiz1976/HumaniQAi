import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Páginas principais para pre-renderizar
const routes = [
    '',
    'blog',
    'nr01',
    'riscos-psicossociais',
    'software-nr01',
    'faq'
];

const baseUrl = 'http://localhost:5173'; // Vite preview server
const distDir = join(__dirname, '..', 'dist');

async function prerenderRoute(browser, route) {
    console.log(`📄 Pre-rendering: /${route}`);

    const page = await browser.newPage();
    const url = `${baseUrl}/${route}`;

    try {
        // Navegar e esperar completo carregamento
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Aguardar React renderizar
        await page.waitForSelector('#root', { timeout: 5000 });

        // Pequeno delay adicional para garantir hydration
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Pegar HTML completo renderizado
        const html = await page.content();

        // Salvar HTML
        const outputPath = route
            ? join(distDir, route, 'index.html')
            : join(distDir, 'index.html');

        if (route) {
            mkdirSync(dirname(outputPath), { recursive: true });
        }

        writeFileSync(outputPath, html);
        console.log(`✅ Salvo: ${outputPath}`);

    } catch (error) {
        console.error(`❌ Erro ao pre-renderizar /${route}:`, error.message);
    } finally {
        await page.close();
    }
}

async function main() {
    console.log('🚀 Iniciando pre-rendering...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        for (const route of routes) {
            await prerenderRoute(browser, route);
        }

        console.log('\n✨ Pre-rendering concluído!');
        console.log('\n📊 Páginas geradas:');
        routes.forEach(r => console.log(`  - /${r}`));

    } catch (error) {
        console.error('\n❌ Erro geral:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

main();
