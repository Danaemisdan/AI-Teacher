const fs = require('fs');
const path = require('path');
const { launchBrowser } = require('./helpers');
const { generateReport } = require('./report');

async function runSpecs() {
    console.log("Starting QA Framework...");
    const browser = await launchBrowser();
    const results = [];
    
    const e2eDir = path.join(process.cwd(), 'tests', 'e2e');
    if (!fs.existsSync(e2eDir)) {
        console.error("No specs found.");
        process.exit(1);
    }

    const files = fs.readdirSync(e2eDir).filter(f => f.endsWith('.spec.js'));
    
    for (const file of files) {
        console.log(`\nExecuting Spec: ${file}`);
        const specPath = path.join(e2eDir, file);
        const spec = require(specPath);
        
        if (typeof spec.run === 'function') {
            const specResults = await spec.run(browser);
            results.push(...specResults);
        }
    }

    await browser.close();
    generateReport(results);
    
    const failed = results.filter(r => !r.passed).length;
    console.log(`\nTest Run Complete. Passed: ${results.length - failed} | Failed: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
}

runSpecs().catch(err => {
    console.error("QA Framework Error:", err);
    process.exit(1);
});
