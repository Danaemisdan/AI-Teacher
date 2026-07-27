const fs = require('fs');

const file = fs.readFileSync('src/components/e-dots.ts', 'utf8');
const match = file.match(/export const E_DOTS = \[([\s\S]+?)\];/);
if (!match) process.exit(1);

const lines = match[1].split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean);

let dots = lines.map(line => {
    const m = line.match(/^M\s+([-\d.]+)\s+([-\d.]+)/);
    if (!m) return null;
    return {
        path: line,
        x: Math.round(parseFloat(m[1])),
        y: Math.round(parseFloat(m[2]))
    };
}).filter(Boolean);

// Find dots by their approximate locations
function findDot(xApprox, yApprox) {
    let closest = null;
    let minDist = Infinity;
    for (let d of dots) {
        if (d.used) continue;
        let dist = Math.hypot(d.x - xApprox, d.y - yApprox);
        if (dist < 20) {
            if (dist < minDist) {
                minDist = dist;
                closest = d;
            }
        }
    }
    if (closest) closest.used = true;
    return closest;
}

const ordered = [];

// Trace 1: Bottom Bar (right to left towards stem)
ordered.push(findDot(220, -40));
ordered.push(findDot(156, -20));
ordered.push(findDot(113, -20));
ordered.push(findDot(69, -20));

// Trace 2: Stem up
ordered.push(findDot(25, -64));
let stemMid = findDot(25, -107);
ordered.push(stemMid);
ordered.push(findDot(25, -151));
ordered.push(findDot(25, -194));

// Trace 3: Top Bar (left to right)
ordered.push(findDot(69, -238));
ordered.push(findDot(113, -238));
ordered.push(findDot(156, -238));
ordered.push(findDot(200, -238));
let extraTop = findDot(200, -238); // duplicate
if (extraTop) ordered.push(extraTop);

// Trace 4: Middle Bar (left to right)
// We branch from the stemMid if possible, but they just appear consecutively.
ordered.push(findDot(69, -107));
ordered.push(findDot(113, -107));
ordered.push(findDot(156, -107));

// Filter out nulls
const finalOrdered = ordered.filter(Boolean);

// Any remaining unused dots?
for (let d of dots) {
    if (!d.used) finalOrdered.push(d);
}

let code = `export const E_DOTS = [\n`;
for (let d of finalOrdered) {
    code += `  "${d.path}",\n`;
}
code += `];\n`;

fs.writeFileSync('src/components/e-dots.ts', code);
console.log("Successfully ordered dots:", finalOrdered.length);
