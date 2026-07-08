const fs = require('fs');
const path = require('path');

const indexJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/assets/index.json'), 'utf8'));

function getRegistryEntry(id) {
    const idLower = id.toLowerCase();
    
    // Exact match
    if (indexJson[idLower]) {
        return { key: idLower, entry: indexJson[idLower] };
    }

    // Fuzzy match for keywords
    let bestMatch = null;
    let bestScore = 0;
    
    for (const key in indexJson) {
        if (idLower.includes(key) || key.includes(idLower)) {
            const score = Math.max(
                idLower.includes(key) ? key.length : 0,
                key.includes(idLower) ? idLower.length : 0
            );
            // Prefer exact word matches over substrings
            const exactWordMatch = new RegExp(`\\b${key}\\b`).test(idLower) || new RegExp(`\\b${idLower}\\b`).test(key);
            const finalScore = exactWordMatch ? score + 100 : score;
            
            if (finalScore > bestScore) {
                bestScore = finalScore;
                bestMatch = { key, entry: indexJson[key] };
            }
        }
    }
    
    return bestMatch;
}

const topic1 = "Introduction to Plant Cell Structure and Function";
const topic2 = "Introduction to Human Digestive System";
const topic3 = "Photosynthesis Basics";

console.log(topic1, "=>", getRegistryEntry(topic1));
console.log(topic2, "=>", getRegistryEntry(topic2));
console.log(topic3, "=>", getRegistryEntry(topic3));
