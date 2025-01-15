const playwright = require('playwright-aws-lambda');

export default async function handler(req, res) {
    let browser = null;

    try {
        browser = await playwright.launchChromium({
            headless: true,
            chromiumSandbox: false,
            args: [
                '--autoplay-policy=user-gesture-required',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-component-update',
                '--disable-default-apps',
                '--disable-dev-shm-usage',
                '--disable-domain-reliability',
                '--disable-extensions',
                '--disable-features=AudioServiceOutOfProcess',
                '--disable-hang-monitor',
                '--disable-ipc-flooding-protection',
                '--disable-notifications',
                '--disable-offer-store-unmasked-wallet-cards',
                '--disable-popup-blocking',
                '--disable-print-preview',
                '--disable-prompt-on-repost',
                '--disable-renderer-backgrounding',
                '--disable-setuid-sandbox',
                '--disable-speech-api',
                '--disable-sync',
                '--hide-scrollbars',
                '--ignore-gpu-blacklist',
                '--metrics-recording-only',
                '--mute-audio',
                '--no-default-browser-check',
                '--no-first-run',
                '--no-pings',
                '--no-sandbox',
                '--no-zygote',
                '--single-process',
                '--use-gl=swiftshader',
            ]
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