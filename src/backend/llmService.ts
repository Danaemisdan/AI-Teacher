import { getLlama, LlamaChatSession, LlamaJsonSchemaGrammar } from "node-llama-cpp";
import fs from "fs";

// TODO: Move this to environment variable in a real prod environment
const MODEL_PATH = "/Users/sanjeevn/Downloads/Momentum AI/momentum-engine-3b.gguf";

let llamaInstance: any = null;
let modelInstance: any = null;

export async function initLlama() {
  if (modelInstance) return { model: modelInstance, llama: llamaInstance };
  
  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`GGUF Missing at ${MODEL_PATH}. Please ensure the model exists.`);
  }
  
  console.log('[NODE] Booting GGUF...');
  llamaInstance = await getLlama({ gpu: "auto" });
  modelInstance = await llamaInstance.loadModel({ modelPath: MODEL_PATH });
  console.log('[NODE] GGUF Ready.');
  
  return { model: modelInstance, llama: llamaInstance };
}

export async function createRequestContext() {
  const { model } = await initLlama();
  // Boot a pristine, physically isolated Context Block
  return await model.createContext({ contextSize: 5500, threads: 4 });
}

export function getLlamaInstance() {
  return llamaInstance;
}
