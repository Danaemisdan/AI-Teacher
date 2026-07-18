import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Capture console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Give it a moment to load
    await new Promise(r => setTimeout(r, 2000));

    // Try to find the input for topic and generate curriculum
    console.log("Entering topic and generating curriculum...");
    try {
        await page.type('input[type="text"]', "Supply and Demand");
        
        // Find and click the generate button
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const genBtn = buttons.find(b => b.textContent.includes('Generate'));
            if (genBtn) genBtn.click();
        });
        
        console.log("Waiting for curriculum to generate...");
        await page.waitForSelector('.module-card', { timeout: 60000 });
        
        console.log("Clicking the first module...");
        const modules = await page.$$('.module-card');
        if (modules.length > 0) {
            await modules[0].click();
            console.log("Waiting for lesson generation (120s)...");
            // Wait for generation to finish or fail
            await new Promise(r => setTimeout(r, 60000));
        } else {
            console.log("No modules found.");
        }
    } catch (e) {
        console.log("Error interacting with page:", e.message);
    }

    console.log("Closing browser...");
    await browser.close();
})();
