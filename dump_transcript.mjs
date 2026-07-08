import fs from 'fs';
import readline from 'readline';

async function parse() {
    const fileStream = fs.createReadStream('c:\\Users\\91844\\.gemini\\antigravity\\brain\\54447e37-f519-448e-9839-f11ea3b38f2f\\.system_generated\\logs\\transcript_full.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            if (data.type === 'USER_INPUT') {
                console.log("USER:", data.content.substring(0, 200).replace(/\n/g, ' '));
            } else if (data.type === 'PLANNER_RESPONSE' && data.content && data.content.includes("Phase")) {
                console.log("MY RESPONSE:", data.content.substring(0, 200).replace(/\n/g, ' '));
            } else if (data.type === 'PLANNER_RESPONSE' && data.content && data.content.includes("possible concepts")) {
                console.log("MY RESPONSE (concepts):", data.content.substring(0, 500).replace(/\n/g, ' '));
            }
        } catch (e) {
            // ignore
        }
    }
}
parse();
