import { getLlama, LlamaChatSession } from "node-llama-cpp";
const MODEL_PATH = "/Users/sanjeevn/Downloads/nexmart/momentum-engine-3b.gguf"

async function run() {
    const llama = await getLlama({ gpu: "auto" });
    const model = await llama.loadModel({ modelPath: MODEL_PATH });
    const context = await model.createContext({ contextSize: 5500, threads: 4 });
    
    let seq1 = context.getSequence();
    const session1 = new LlamaChatSession({ contextSequence: seq1, systemPrompt: "You are a test" });
    
    let res1 = "";
    await session1.prompt("Say hello", { onTextChunk(c) { res1 += c; } });
    console.log("RES1:", res1);
    
    session1.dispose();
    seq1.dispose();
    
    let seq2 = context.getSequence();
    const session2 = new LlamaChatSession({ contextSequence: seq2, systemPrompt: "You are a test 2" });
    
    let res2 = "";
    await session2.prompt("Say world", { onTextChunk(c) { res2 += c; } });
    console.log("RES2:", res2);
    
    session2.dispose();
    seq2.dispose();
}

run().catch(console.error);
