async function getMemoryMetrics(page) {
    return await page.evaluate(() => {
        return {
            jsHeapSize: window.performance && window.performance.memory ? window.performance.memory.usedJSHeapSize : 0,
            domNodeCount: document.getElementsByTagName('*').length,
            canvasCount: document.getElementsByTagName('canvas').length,
            svgCount: document.getElementsByTagName('svg').length
        };
    });
}

async function getTelemetry(page) {
    return await page.evaluate(() => {
        const debugPanel = document.querySelector('.fixed.bottom-4.left-4');
        if (!debugPanel) return null;
        
        const lines = debugPanel.innerText.split('\n');
        const telemetry = {};
        for (const line of lines) {
            if (line.includes(':')) {
                const [key, ...rest] = line.split(':');
                telemetry[key.trim()] = rest.join(':').trim();
            }
        }
        return telemetry;
    });
}

module.exports = { getMemoryMetrics, getTelemetry };
