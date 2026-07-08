import fs from 'fs';
import readline from 'readline';

async function parse() {
    const fileStream = fs.createReadStream('c:\\Users\\91844\\.gemini\\antigravity\\brain\\54447e37-f519-448e-9839-f11ea3b38f2f\\.system_generated\\logs\\transcript.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let foundPrompt = false;
    for await (const line of rl) {
        const data = JSON.parse(line);
        if (data.type === 'USER_INPUT' && data.content.includes("tell me all the possible concepts")) {
            foundPrompt = true;
        } else if (foundPrompt && data.type === 'PLANNER_RESPONSE' && data.content) {
            console.log("MY RESPONSE:");
            console.log(data.content.substring(0, 1000));
            return;
        }
    }
}
parse();
