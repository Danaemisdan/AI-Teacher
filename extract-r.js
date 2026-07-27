const fs = require('fs');
const content = fs.readFileSync('../E-i letters/5.svg', 'utf8');

const match = content.match(/d="([^"]+)"/);
if (match) {
  let pathString = match[1];
  pathString = pathString.replace(/Z M/g, 'Z|M');
  let dots = pathString.split('|').map(x => x.trim()).filter(Boolean);
  
  // Remove extremely short terminating segments
  dots = dots.filter(d => d.length > 20);

  let code = "export const R_DOTS = [\n";
  dots.forEach(p => {
    code += `  "${p}",\n`;
  });
  code += "];\n";

  fs.writeFileSync('src/components/r-dots.ts', code);
  console.log("Extracted R dots:", dots.length);
}
