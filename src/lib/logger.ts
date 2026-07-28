let ctx = {
  state: "idle",
  aiStatus: "idle",
  conversationMode: false
};

export function setPipelineContext(state: string, aiStatus: string, conversationMode: boolean) {
  ctx.state = state;
  ctx.aiStatus = aiStatus;
  ctx.conversationMode = conversationMode;
}

export function logPipeline(eventName: string, details?: any) {
  const date = new Date();
  const timestamp = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`;
  
  const msg = `[PIPELINE][${timestamp}]\nState=${ctx.state}\nAI=${ctx.aiStatus}\nConversationMode=${ctx.conversationMode}\n${eventName}`;
  
  if (details !== undefined) {
    console.log(msg, details);
  } else {
    console.log(msg);
  }
}
