const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

export default async function handler(req, res) {
    let browser = null;

    try {
        // Configuración específica para Vercel
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: true,
        });

        const page = await browser.newPage();
        const daosUrl = `https://www.daos.fun/CvuZk1iAPQsWdTy777a4dY78ue8z6HsRbk8UZCXvMSmB`;

        await page.goto(daosUrl, { waitUntil: "networkidle2" });

        const tableSelector = 'table.w-full';
        await page.waitForSelector(tableSelector, { timeout: 2000 });

        const transactions = await page.evaluate(() => {
            const rows = Array.from(
                document.querySelectorAll("table.w-full tbody tr")
            );
            return rows.map((row) => {
                const cells = Array.from(row.querySelectorAll("td"));
                return cells.map((cell) => cell.textContent.trim());
            });
        });

        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
}