const fs = require('fs');

const file = fs.readFileSync('src/components/e-dots.ts', 'utf8');

// Parse the array
const match = file.match(/export const E_DOTS = \[([\s\S]+?)\];/);
if (!match) process.exit(1);

const lines = match[1].split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean);

const dots = lines.map(line => {
  const m = line.match(/^M\s+([-\d.]+)\s+([-\d.]+)/);
  if (!m) return null;
  return {
    path: line,
    x: parseFloat(m[1]),
    y: parseFloat(m[2])
  };
}).filter(Boolean);

console.log("Found", dots.length, "dots.");
dots.forEach((d, i) => console.log(`Dot ${i}: x=${Math.round(d.x)}, y=${Math.round(d.y)}`));

// Sort them to form a path from bottom-left to top, then the branches.
// E stem x is probably roughly the minimum x.
// Top bar y is min y (highest up). Bottom bar y is max y (lowest down).
