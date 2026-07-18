const { startLesson, waitForVisualization } = require('../qa/helpers');
const { captureScreenshots } = require('../qa/screenshots');
const { getMemoryMetrics, getTelemetry } = require('../qa/metrics');
const { assertUI, verifyInteractive } = require('../qa/assertions');

const CORE_TOPICS = [
    { prompt: "Teach me Supply and Demand", expectedType: "jsxgraph" },
    { prompt: "Teach me Photosynthesis", expectedType: "concept" },
    { prompt: "Teach me Human Heart", expectedType: "anatomy" },
    { prompt: "Teach me Methane", expectedType: "3dmol" },
    { prompt: "Teach me Binary Trees", expectedType: "mermaid" },
    { prompt: "Teach me Newton's Laws", expectedType: "concept" },
    { prompt: "Teach me DNA Replication", expectedType: "concept" },
    { prompt: "Teach me Water Cycle", expectedType: "concept" }
];

async function run(browser) {
    const results = [];
    const page = await browser.newPage();

    // Attach console listener for React/WebGPU errors
    const pageErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            const text = msg.text();
            if (text.includes('React') || text.includes('WebGPU') || text.includes('Memory') || text.includes('WebGL')) {
                pageErrors.push(`[${msg.type()}] ${text}`);
            }
        }
    });
    
    // Group 1, 2, 3, 4, 5
    for (const topic of CORE_TOPICS) {
        console.log(`Running Core Test: ${topic.prompt}`);
        
        let testResult = { name: topic.prompt, passed: true, errors: [], telemetry: null, memory: null, screenshots: null };
        
        try {
            // First pass (Generation / Miss fallback)
            await startLesson(page, topic.prompt);
            await waitForVisualization(page);
            
            const telemetry1 = await getTelemetry(page);
            if (!telemetry1) {
                testResult.errors.push("Debug panel telemetry not found");
                testResult.passed = false;
            } else {
                testResult.telemetry = telemetry1;
            }

            const uiErrors = await assertUI(page);
            if (uiErrors.length > 0) {
                testResult.errors.push(...uiErrors);
                testResult.passed = false;
            }

            // Test Interactions
            try {
                await verifyInteractive(page, topic.expectedType);
            } catch (e) {
                testResult.errors.push(`Interaction failed: ${e.message}`);
                testResult.passed = false;
            }

            testResult.screenshots = await captureScreenshots(page, topic.prompt);
            testResult.memory = await getMemoryMetrics(page);
            
            if (pageErrors.length > 0) {
                testResult.errors.push(...pageErrors);
                testResult.passed = false;
            }
            pageErrors.length = 0; // reset for next pass
            
            results.push(testResult);

            // Second pass (Cache Check)
            console.log(`Running Cache Test: ${topic.prompt}`);
            const cacheResult = { name: `${topic.prompt} (Cache Check)`, passed: true, errors: [], telemetry: null, memory: null };
            await startLesson(page, topic.prompt);
            await waitForVisualization(page);
            
            const telemetry2 = await getTelemetry(page);
            if (telemetry2 && telemetry2.Cache !== 'HIT') {
                cacheResult.errors.push("Expected Cache HIT but got MISS");
                cacheResult.passed = false;
            }
            cacheResult.telemetry = telemetry2;
            cacheResult.memory = await getMemoryMetrics(page);
            
            results.push(cacheResult);

        } catch (e) {
            testResult.passed = false;
            testResult.errors.push(`Fatal execution error: ${e.message}`);
            results.push(testResult);
        }
    }
    
    await page.close();
    return results;
}

module.exports = { run };
