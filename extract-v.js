const fs = require('fs');

const file = fs.readFileSync('src/components/svg-paths.ts', 'utf8');
const match = file.match(/V:\s*'([^']+)'/);

if (match) {
  let pathString = match[1];
  pathString = pathString.replace(/Z M/g, 'Z|M');
  let dots = pathString.split('|').map(x => x.trim()).filter(Boolean);

  console.log("Raw V dots:", dots.length); // 14

  let baseDots = [];
  for (let d of dots) {
    baseDots.push(d);
  }

  // E has 16 dots. V has 14 dots.
  // We need to duplicate 2 dots to allow 1:1 index mapping in Framer Motion for path morphing.
  // I'll just duplicate the very last dot twice.
  if (baseDots.length > 0) {
      while(baseDots.length < 16) {
          baseDots.push(baseDots[baseDots.length - 1]);
      }
  }

  console.log("Aligned V dots:", baseDots.length);

  let code = "export const V_DOTS = [\n";
  baseDots.forEach(p => {
    code += `  "${p}",\n`;
  });
  code += "];\n";

  fs.writeFileSync('src/components/v-dots.ts', code);
} else {
  console.log("Could not find V path in svg-paths.ts");
}
