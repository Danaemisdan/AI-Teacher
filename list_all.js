import { prebuiltAppConfig } from "@mlc-ai/web-llm";
const models = prebuiltAppConfig.model_list.map(m => m.model_id);
console.log(models.filter(m => m.toLowerCase().includes('smol') || m.toLowerCase().includes('0.1') || m.toLowerCase().includes('0.3')));
