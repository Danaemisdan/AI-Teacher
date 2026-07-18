const { startLesson, waitForVisualization } = require('../qa/helpers');
const { getMemoryMetrics, getTelemetry } = require('../qa/metrics');
const { captureScreenshots } = require('../qa/screenshots');

async function run(browser) {
    const results = [];
    const page = await browser.newPage();
    let initialHeap = null;

    const pageErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            const text = msg.text();
            if (text.includes('WebGPU') || text.includes('context loss') || text.includes('React')) {
                pageErrors.push(`[${msg.type()}] ${text}`);
            }
        }
    });

    for (let i = 1; i <= 25; i++) {
        const prompt = `Teach me Scientific Concept ${i}`;
        console.log(`Running Stress Test ${i}/25: ${prompt}`);
        
        const testResult = { name: `Stress Iteration ${i}`, passed: true, errors: [], telemetry: null, memory: null };
        
        try {
            await startLesson(page, prompt);
            await waitForVisualization(page);
            
            testResult.telemetry = await getTelemetry(page);
            const mem = await getMemoryMetrics(page);
            testResult.memory = mem;

            if (i === 1) {
                initialHeap = mem.jsHeapSize;
            } else if (i === 25) {
                // If heap has grown by more than 200MB, flag it
                if (mem.jsHeapSize - initialHeap > 200 * 1024 * 1024) {
                    testResult.errors.push(`Memory leak detected: Heap grew by ${Math.round((mem.jsHeapSize - initialHeap)/1024/1024)}MB`);
                    testResult.passed = false;
                }
            }
            
            // Context loss or renderer crashes
            if (pageErrors.length > 0) {
                testResult.errors.push(...pageErrors);
                testResult.passed = false;
            }
            pageErrors.length = 0;
            
            results.push(testResult);
        } catch (e) {
            testResult.passed = false;
            testResult.errors.push(`Stress iteration failed: ${e.message}`);
            results.push(testResult);
        }
    }
    
    await page.close();
    return results;
}

module.exports = { run };
