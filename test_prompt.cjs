const fs = require('fs');
const path = require('path');

const indexJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/assets/index.json'), 'utf8'));

let context = "";
for (const [id, entry] of Object.entries(indexJson)) {
    context += `- ID: ${id} | Type: ${entry.renderer}\n`;
}
console.log(context);
