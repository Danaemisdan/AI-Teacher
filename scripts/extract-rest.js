const fs = require('fs');

function extractPaths(inputFile, outputFile, variableName) {
    const content = fs.readFileSync(inputFile, 'utf8');
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

    let code = `export const ${variableName} = [\n`;
    dots.forEach(p => {
        code += `  "${p}",\n`;
    });
    code += "];\n";

    fs.writeFileSync(outputFile, code);
    console.log(`Extracted ${variableName}: ${dots.length} paths`);
}

extractPaths('../E-i letters/8.svg', 'src/components/h-dots.ts', 'H_DOTS');
extractPaths('../E-i letters/9.svg', 'src/components/i-dots.ts', 'I_DOTS');
extractPaths('../E-i letters/10.svg', 'src/components/n-dots.ts', 'N_DOTS');
extractPaths('../E-i letters/11.svg', 'src/components/g-dots.ts', 'G_DOTS');
extractPaths('../E-i letters/12.svg', 'src/components/a-dots.ts', 'A_DOTS');
extractPaths('../E-i letters/13.svg', 'src/components/i2-dots.ts', 'I2_DOTS');
