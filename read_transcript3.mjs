import fs from 'fs';
import readline from 'readline';

async function parse() {
    const fileStream = fs.createReadStream('c:\\Users\\91844\\.gemini\\antigravity\\brain\\54447e37-f519-448e-9839-f11ea3b38f2f\\.system_generated\\logs\\transcript.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        const data = JSON.parse(line);
        if (data.type === 'PLANNER_RESPONSE' && data.content && data.content.includes("After the success of the photosynthesis")) {
            console.log(data.content);
        } else if (data.type === 'PLANNER_RESPONSE' && data.content && data.content.includes("Phase 4")) {
            console.log(data.content);
        }
    }
}
parse();
