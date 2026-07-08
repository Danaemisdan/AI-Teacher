import fs from 'fs';
import readline from 'readline';

async function parse() {
    const fileStream = fs.createReadStream('c:\\Users\\91844\\.gemini\\antigravity\\brain\\54447e37-f519-448e-9839-f11ea3b38f2f\\.system_generated\\logs\\transcript_full.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let found = false;
    for await (const line of rl) {
        try {
            const data = JSON.parse(line);
            if (data.type === 'USER_INPUT' && data.content.toLowerCase().includes("after the success of photosynthesis")) {
                found = true;
            } else if (found && data.type === 'PLANNER_RESPONSE' && data.content) {
                console.log(data.content);
                return;
            }
        } catch (e) {}
    }
}
parse();
