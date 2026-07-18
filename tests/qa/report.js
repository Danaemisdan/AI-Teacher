const fs = require('fs');
const path = require('path');
const config = require('./config');

if (!fs.existsSync(config.reportDir)) {
    fs.mkdirSync(config.reportDir, { recursive: true });
}

function generateReport(results) {
    const jsonPath = path.join(config.reportDir, 'qa-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

    const htmlPath = path.join(config.reportDir, 'qa-report.html');
    const html = `
    <!DOCTYPE html>
    <html>
    <head><title>AI Teacher QA Report</title><style>
        body { font-family: sans-serif; background: #111; color: #eee; padding: 20px; }
        .pass { color: #4ade80; } .fail { color: #f87171; }
        .card { background: #222; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        img { max-width: 100%; height: auto; margin-top: 10px; border: 1px solid #444; }
    </style></head>
    <body>
        <h1>AI Teacher QA Report</h1>
        <h2>Total Tests: ${results.length}</h2>
        ${results.map(r => `
            <div class="card">
                <h3>${r.name} - <span class="${r.passed ? 'pass' : 'fail'}">${r.passed ? 'PASS' : 'FAIL'}</span></h3>
                <p><strong>Errors:</strong> ${r.errors.length > 0 ? r.errors.join(', ') : 'None'}</p>
                <p><strong>Telemetry:</strong> ${JSON.stringify(r.telemetry)}</p>
                <p><strong>Memory:</strong> JS Heap: ${Math.round(r.memory.jsHeapSize / 1024 / 1024)} MB | DOM Nodes: ${r.memory.domNodeCount}</p>
                ${r.screenshots ? Object.entries(r.screenshots).map(([k, v]) => `
                    <div><strong>${k}:</strong><br><img src="file://${v}" /></div>
                `).join('') : ''}
            </div>
        `).join('')}
    </body>
    </html>`;
    fs.writeFileSync(htmlPath, html);
    console.log(`Reports generated at ${config.reportDir}`);
}

module.exports = { generateReport };
