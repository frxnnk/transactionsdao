const playwright = require('playwright-aws-lambda');

export default async function handler(req, res) {
    let browser = null;

    try {
        browser = await playwright.launchChromium({
            headless: true
        });
        
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            javaScriptEnabled: true,
        });
        
        const page = await context.newPage();
        
        // Bloquear recursos innecesarios para ahorrar memoria
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