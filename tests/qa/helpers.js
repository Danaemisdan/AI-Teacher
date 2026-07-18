const puppeteer = require('puppeteer');
const config = require('./config');

async function launchBrowser() {
    return await puppeteer.launch({
        headless: config.headless,
        args: [
            '--enable-unsafe-webgpu',
            '--enable-features=Vulkan',
            '--window-size=1280,800'
        ]
    });
}

async function startLesson(page, prompt) {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    
    // Wait for the UI to be ready (webLLM loaded)
    await page.waitForFunction(() => {
        const btn = document.querySelector('button[type="submit"]');
        return btn && !btn.disabled;
    }, { timeout: 60000 });

    await page.type('input[type="text"]', prompt);
    await page.click('button[type="submit"]');
}

async function waitForVisualization(page) {
    // Wait for the debug panel and visualization to settle
    await page.waitForFunction(() => {
        const debugPanel = document.querySelector('.fixed.bottom-4.left-4');
        const graphic = document.querySelector('.prose') || document.querySelector('svg') || document.querySelector('canvas') || document.querySelector('.jxgbox');
        return (debugPanel && debugPanel.innerText.includes('VISUALIZATION PIPELINE')) || graphic;
    }, { timeout: 120000 });
    // Let rendering settle
    await new Promise(r => setTimeout(r, 2000));
}

module.exports = {
    launchBrowser,
    startLesson,
    waitForVisualization
};
