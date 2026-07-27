const fs = require('fs');
const content = fs.readFileSync('../E-i letters/5.svg', 'utf8');

// Find all path 'd' attributes
let maxLen = 0;
let bestPath = "";
const matches = [...content.matchAll(/d="([^"]+)"/g)];
for (const match of matches) {
    if (match[1].length > maxLen) {
        maxLen = match[1].length;
        bestPath = match[1];
    }
}

let pathString = bestPath.replace(/Z M/g, 'Z|M');
let dots = pathString.split('|').map(x => x.trim()).filter(Boolean);

let code = "export const R_DOTS = [\n";
dots.forEach(p => {
    code += `  "${p}",\n`;
});
code += "];\n";

fs.writeFileSync('src/components/r-dots.ts', code);
console.log("Extracted R dots:", dots.length);
