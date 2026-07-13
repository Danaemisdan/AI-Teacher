import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import wikipedia from 'wikipedia';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_DB_PATH = path.join(__dirname, '..', 'public', 'knowledge.json');
const OLD_ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface KnowledgeEntry {
    facts: string[];
    visual_highlights: string[];
}

/**
 * Ensures the DB exists and loads it
 */
function loadDb(): Record<string, KnowledgeEntry> {
    if (!fs.existsSync(KNOWLEDGE_DB_PATH)) {
        fs.writeFileSync(KNOWLEDGE_DB_PATH, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(KNOWLEDGE_DB_PATH, 'utf-8'));
}

/**
 * Saves the DB
 */
function saveDb(db: Record<string, KnowledgeEntry>) {
    fs.writeFileSync(KNOWLEDGE_DB_PATH, JSON.stringify(db, null, 2));
}

/**
 * Migration Mode: Scans public/assets/.../lesson.json and migrates them
 */
async function migrateHardcodedLessons() {
    console.log('--- Starting Migration Mode ---');
    const db = loadDb();

    function scanDir(dirPath: string) {
        if (!fs.existsSync(dirPath)) return;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath);
            } else if (file === 'lesson.json') {
                try {
                    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
                    if (data.title && data.steps) {
                        const facts: string[] = [];
                        const highlights: string[] = [];

                        data.steps.forEach((step: any) => {
                            if (step.speech) facts.push(step.speech);
                            if (step.highlight) {
                                // some highlights are comma separated like "helicase, replication_fork"
                                step.highlight.split(',').forEach((h: string) => {
                                    const clean = h.trim();
                                    if (clean && !highlights.includes(clean)) highlights.push(clean);
                                });
                            }
                        });

                        const key = data.title.toLowerCase().replace(/ /g, '_');
                        db[key] = { facts, visual_highlights: highlights };
                        console.log(`Migrated: ${key}`);
                    }
                } catch (e) {
                    console.error(`Failed to migrate ${fullPath}`, e);
                }
            }
        }
    }

    scanDir(OLD_ASSETS_DIR);
    saveDb(db);
    console.log('--- Migration Complete ---');
}

/**
 * Internet Gathering Mode: Uses Wikipedia + Gemini
 */
async function gatherInternetInfo(topic: string) {
    console.log(`--- Gathering Info for: ${topic} ---`);
    console.log(`--- Gathering Info for: ${topic} ---`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set in .env! Using local mock fallback for demonstration...");
    }

    const db = loadDb();
    const key = topic.toLowerCase().replace(/ /g, '_');

    // 1. Fetch from Wikipedia
    let rawText = '';
    try {
        console.log(`Searching Wikipedia for "${topic}"...`);
        const page = await wikipedia.page(topic);
        const intro = await page.intro();
        const content = await page.content();
        rawText = intro + '\n' + content.substring(0, 5000); // Take first 5k chars to avoid token limits
    } catch (e) {
        console.error(`Wikipedia search failed for ${topic}. Proceeding with raw AI knowledge...`);
    }

    // 2. Synthesize using AI
    console.log("Synthesizing facts using Gemini...");
    const prompt = `
    You are an expert educator. Extract exactly 5-8 core educational facts about the topic "${topic}".
    Use the following Wikipedia source if available, or your own knowledge.
    Source: ${rawText}
    `;

    try {
        if (!process.env.GEMINI_API_KEY) {
            // Mock fallback
            db[key] = {
                facts: [
                    "The sitar is a plucked stringed instrument, originating from the Indian subcontinent.",
                    "It is used in Hindustani classical music.",
                    "The instrument typically has 18, 19, 20, or 21 strings.",
                    "It has sympathetic strings that resonate to add richness to the sound.",
                    "The sitar gained worldwide popularity in the 1960s thanks to Ravi Shankar and The Beatles."
                ],
                visual_highlights: ["strings", "resonator", "frets"]
            };
            saveDb(db);
            console.log(`Successfully gathered and saved (MOCKED) info for: ${key}`);
            return;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        facts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 5-8 clear, self-contained educational facts."
                        },
                        visual_highlights: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 3-5 visual keywords that might appear in a diagram (e.g. 'crust', 'strings', 'orbit')."
                        }
                    },
                    required: ["facts", "visual_highlights"]
                }
            }
        });

        if (response.text) {
            const result = JSON.parse(response.text);
            db[key] = {
                facts: result.facts,
                visual_highlights: result.visual_highlights
            };
            saveDb(db);
            console.log(`Successfully gathered and saved info for: ${key}`);
            console.log("Facts:", result.facts);
        }
    } catch (e) {
        console.error("AI Generation failed:", e);
    }
}

// Simple CLI router
(async () => {
    const args = process.argv.slice(2);
    if (args.includes('--migrate')) {
        await migrateHardcodedLessons();
    } else if (args.includes('--topics')) {
        const topicsIdx = args.indexOf('--topics') + 1;
        if (topicsIdx < args.length) {
            const topicsList = args[topicsIdx].split(',').map(t => t.trim());
            for (const t of topicsList) {
                await gatherInternetInfo(t);
            }
        } else {
            console.error("Please provide a comma-separated list of topics after --topics");
        }
    } else {
        console.log("Usage: ");
        console.log("  tsx scripts/build_knowledge_db.ts --migrate");
        console.log("  tsx scripts/build_knowledge_db.ts --topics \"Sitara, Black Holes\"");
    }
})();
