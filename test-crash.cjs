const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            if (text.includes("length")) {
                 console.log("BROWSER ERROR:", text);
            }
        }
    });

    page.on('pageerror', err => {
        console.log("PAGE ERROR:", err.toString(), err.stack);
    });

    console.log("Navigating to http://localhost:8080...");
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });
    
    // Give it a moment to render and crash
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
})();
