const chromium = require('@sparticuz/chromium');
const playwright = require('playwright-core');

export default async function handler(req, res) {
    let browser = null;

    try {
        // Configurar chromium
        const executablePath = await chromium.executablePath;
        
        // Iniciar el navegador
        browser = await playwright.chromium.launch({
            args: chromium.args,
            executablePath: executablePath,
            headless: true,
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
        });
        
        const page = await context.newPage();
        
        // Bloquear recursos innecesarios
        await page.route('**/*.{png,jpg,jpeg,gif,css,font,woff,woff2}', route => route.abort());
        
        const daosUrl = `https://www.daos.fun/CvuZk1iAPQsWdTy777a4dY78ue8z6HsRbk8UZCXvMSmB`;
        await page.goto(daosUrl, { waitUntil: 'domcontentloaded' });
        
        const tableSelector = 'table.w-full';
        await page.waitForSelector(tableSelector, { timeout: 5000 });
        
        const transactions = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll("table.w-full tbody tr"));
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll("td"));
                return cells.map(cell => cell.textContent.trim());
            });
        });
        
        res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}