const path = require('path');

const config = {
    baseUrl: process.env.QA_BASE_URL || 'http://localhost:3000',
    headless: process.env.QA_HEADLESS === 'false' ? false : 'new',
    screenshotsDir: path.join(process.cwd(), 'qa-screenshots'),
    reportDir: path.join(process.cwd(), 'qa-reports')
};

module.exports = config;
