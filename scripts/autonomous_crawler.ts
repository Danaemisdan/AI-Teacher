import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import wikipedia from 'wikipedia';
import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.join(__dirname, '..', 'momentum-engine-3b.gguf');
const KNOWLEDGE_DB_PATH = path.join(__dirname, '..', 'public', 'knowledge.json');

// Initialize state
let db = loadDb();
let queue: string[] = ["Quantum Physics", "Biology", "World History", "Music Theory"];

function loadDb() {
    if (!fs.existsSync(KNOWLEDGE_DB_PATH)) {
        fs.writeFileSync(KNOWLEDGE_DB_PATH, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(KNOWLEDGE_DB_PATH, 'utf-8'));
}

function saveDb(newDb: any) {
    fs.writeFileSync(KNOWLEDGE_DB_PATH, JSON.stringify(newDb, null, 2));
}

function commitToGit(topic: string) {
    try {
        console.log("Committing to GitHub...");
        execSync('git add public/knowledge.json', { cwd: path.join(__dirname, '..') });
        execSync(`git commit -m "auto: learned about ${topic}"`, { cwd: path.join(__dirname, '..') });
        execSync('git push origin main', { cwd: path.join(__dirname, '..') });
        console.log("Push successful!");
    } catch (e) {
        console.error("Git push failed:", e);
    }
}

async function startCrawler() {
    console.log("Loading GGUF model (this may take a moment)...");
    const llama = await getLlama();
    const model = await llama.loadModel({ modelPath: MODEL_PATH });
    const context = await model.createContext();
    
    console.log("Model loaded. Starting infinite crawl loop...");

    while (true) {
        if (queue.length === 0) {
            queue.push("Science", "Technology", "Art"); // Fallback
        }

        const currentTopic = queue.shift()!;
        const key = currentTopic.toLowerCase().replace(/ /g, '_');

        if (db[key]) {
            console.log(`Skipping ${currentTopic}, already known.`);
            continue;
        }

        console.log(`\n\n--- Crawling: ${currentTopic} ---`);
        let rawText = '';
        let sourceUrl = '';
        try {
            const page = await wikipedia.page(currentTopic);
            const intro = await page.intro();
            sourceUrl = page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(currentTopic)}`;
            rawText = intro;
            console.log("Scraped Wikipedia successfully.");
        } catch (e) {
            console.warn(`Wikipedia search failed for ${currentTopic}. Will rely purely on local LLM knowledge.`);
        }

        // We use a fresh chat session for each topic to avoid hallucination crossover
        const session = new LlamaChatSession({
            contextSequence: context.getSequence()
        });

        console.log("Asking Llama to synthesize facts...");
        const synthesisPrompt = `
Topic: "${currentTopic}"
Source Context: ${rawText}

Task: Output a strictly valid JSON object with the following schema exactly:
{
  "facts": ["fact 1", "fact 2", "fact 3", "fact 4", "fact 5"],
  "visual_highlights": ["keyword1", "keyword2"],
  "recommended_engine": "concept_diagram"
}

Do NOT use markdown code blocks like \`\`\`json. Just output the raw JSON object.
Make sure facts are highly educational and concise.
`;

        let result = await session.prompt(synthesisPrompt, {
            temperature: 0.1
        });

        // Try to parse the result
        let parsed = null;
        try {
            // Find JSON boundaries in case the model adds chatter
            const start = result.indexOf('{');
            const end = result.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                parsed = JSON.parse(result.substring(start, end + 1));
            }
        } catch (e) {
            console.error("Failed to parse LLM JSON output:", result);
            continue;
        }

        if (parsed && parsed.facts) {
            db[key] = {
                facts: parsed.facts,
                visual_highlights: parsed.visual_highlights || [],
                recommended_engine: parsed.recommended_engine || "concept_diagram",
                source_urls: sourceUrl ? [sourceUrl] : []
            };
            saveDb(db);
            console.log(`Successfully mapped ${currentTopic}!`);
            commitToGit(currentTopic);

            // Now branch out! Ask the model for sub-topics to keep the crawler going forever.
            console.log("Asking Llama for highly-verified deep sub-topics...");
            const branchPrompt = `We are researching "${currentTopic}". List 3 extremely deep, advanced sub-topics related to this that have highly backed, scientifically/historically verified information. Do not list random or irrelevant crap. Output them as a comma separated list ONLY. (e.g. Subtopic A, Subtopic B, Subtopic C). No other text.`;
            
            // Re-use the existing session so we don't run out of context sequences
            const branchResult = await session.prompt(branchPrompt, { temperature: 0.7 });
            
            const newTopics = branchResult.split(',').map(t => t.trim().replace(/['"]/g, ''));
            for (const t of newTopics) {
                if (t && !db[t.toLowerCase().replace(/ /g, '_')] && !queue.includes(t)) {
                    queue.push(t);
                    console.log(`Queued new discovery topic: ${t}`);
                }
            }
        }

        // Yield to event loop briefly, no need for long rest!
        await new Promise(r => setTimeout(r, 1000));
    }
}

startCrawler().catch(console.error);
