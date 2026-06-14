import { prebuiltAppConfig } from "@mlc-ai/web-llm";
console.log(prebuiltAppConfig.model_list.map(m => m.model_id).filter(id => id.toLowerCase().includes('tiny') || id.toLowerCase().includes('qwen') || id.toLowerCase().includes('0.5') || id.toLowerCase().includes('1b')));
