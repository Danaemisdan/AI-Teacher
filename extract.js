const fs = require('fs');

// We already extracted it cleanly into svg-paths.ts, so we'll just read from that string
const file = fs.readFileSync('src/components/svg-paths.ts', 'utf8');
const E_match = file.match(/E:\s*'([^']+)'/);

if (E_match) {
  let pathString = E_match[1];

  // The actual format is 'M ... Z M ... Z'.
  pathString = pathString.replace(/Z M/g, 'Z|M');
  let dots = pathString.split('|').map(x => x.trim()).filter(Boolean);

  console.log("Extracted dots:", dots.length);

  let code = "export const E_DOTS = [\n";
  dots.forEach(p => {
    code += `  "${p}",\n`;
  });
  code += "];\n";

  fs.writeFileSync('src/components/e-dots.ts', code);
}
