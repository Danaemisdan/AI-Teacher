const topic = "Solar System";
const moduleName = "1. Introduction & Basics";
const fullQuery = (topic + " " + (moduleName || "")).toLowerCase();
const keyLower = "solar system";

const exactWordMatch = new RegExp(`\\b${keyLower}\\b`, 'i').test(fullQuery);

const baseKey = keyLower.replace(/ic\b|es\b|s\b|ion\b/, '');
const partialWordMatch = baseKey.length > 3 && new RegExp(`\\b${baseKey}[a-z]*\\b`, 'i').test(fullQuery);

console.log({
    fullQuery,
    exactWordMatch,
    partialWordMatch,
    includes1: fullQuery.includes(keyLower),
    includes2: keyLower.includes(topic.toLowerCase())
});
