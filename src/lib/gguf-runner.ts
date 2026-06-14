import { getLlama, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import fs from "fs";

// Using the exact GGUF provided by user
const MODEL_PATH = "/Users/sanjeevn/Downloads/nexmart/momentum-engine-3b.gguf"

// We cache these to avoid reloading the model on every request
let llamaInstance: any = null;
let modelInstance: any = null;
let contextInstance: any = null;

export async function initializeGGUF() {
  if (contextInstance) return { context: contextInstance, llama: llamaInstance };

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`Model not found at ${MODEL_PATH}.`);
  }

  console.log('[GGUF] Booting momentum-engine-3b directly into Node memory...')
  
  // Initialize standard node-llama-cpp instances
  llamaInstance = await getLlama();
  
  modelInstance = await llamaInstance.loadModel({
    modelPath: MODEL_PATH
  });
  
  contextInstance = await modelInstance.createContext();
  
  console.log('[GGUF] Model loaded successfully.')
  return { context: contextInstance, llama: llamaInstance };
}

export async function promptGGUF(systemPrompt: string, userMessage: string, onToken: (t: string) => void) {
  const { context } = await initializeGGUF();
  
  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
    systemPrompt: systemPrompt
  });

  const response = await session.prompt(userMessage, {
    onTextChunk(chunk: string) {
      onToken(chunk);
    }
  });

  return response;
}
