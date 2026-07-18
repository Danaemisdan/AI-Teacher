const fs = require('fs');
const path = require('path');
const config = require('./config');

if (!fs.existsSync(config.screenshotsDir)) {
    fs.mkdirSync(config.screenshotsDir, { recursive: true });
}

async function captureScreenshots(page, testName) {
    const safeName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const fullPath = path.join(config.screenshotsDir, `${safeName}_full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    let vizPath = null;
    const vizElement = await page.$('.jxgbox, canvas, svg');
    if (vizElement) {
        vizPath = path.join(config.screenshotsDir, `${safeName}_viz.png`);
        await vizElement.screenshot({ path: vizPath });
    }

    let debugPath = null;
    const debugPanel = await page.$('.fixed.bottom-4.left-4');
    if (debugPanel) {
        debugPath = path.join(config.screenshotsDir, `${safeName}_debug.png`);
        await debugPanel.screenshot({ path: debugPath });
    }

    return { fullPath, vizPath, debugPath };
}

module.exports = { captureScreenshots };
