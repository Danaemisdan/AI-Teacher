const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const nextChunksDir = path.join(publicDir, '_next', 'static', 'chunks');

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(nextChunksDir, { recursive: true });

// Copy VAD models to public/
fs.copyFileSync(
  path.join(__dirname, 'node_modules', '@ricky0123', 'vad-web', 'dist', 'silero_vad_legacy.onnx'),
  path.join(publicDir, 'silero_vad_legacy.onnx')
);
fs.copyFileSync(
  path.join(__dirname, 'node_modules', '@ricky0123', 'vad-web', 'dist', 'silero_vad_v5.onnx'),
  path.join(publicDir, 'silero_vad_v5.onnx')
);
fs.copyFileSync(
  path.join(__dirname, 'node_modules', '@ricky0123', 'vad-web', 'dist', 'vad.worklet.bundle.min.js'),
  path.join(publicDir, 'vad.worklet.bundle.min.js')
);

// Copy ORT files to public/_next/static/chunks/
const ortDist = path.join(__dirname, 'node_modules', 'onnxruntime-web', 'dist');
const ortFiles = fs.readdirSync(ortDist);
for (const file of ortFiles) {
  if (file.endsWith('.wasm') || file.endsWith('.mjs')) {
    fs.copyFileSync(path.join(ortDist, file), path.join(nextChunksDir, file));
  }
}

// Also copy WASM files to public/ just in case it fetches from root
for (const file of ortFiles) {
  if (file.endsWith('.wasm')) {
    fs.copyFileSync(path.join(ortDist, file), path.join(publicDir, file));
  }
}

console.log("Assets copied successfully to public/ and public/_next/static/chunks/");
