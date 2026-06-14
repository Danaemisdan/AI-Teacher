import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';

// Use the super-fast Edge runtime
export const runtime = 'edge';

const groq = createOpenAI({
  name: 'groq',
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { messages, isJson } = await req.json();

    if (isJson) {
       // Non-streaming JSON extraction (Product Identification)
       const { text } = await generateText({
           model: groq.chat('llama3-8b-8192'),
           messages,
           temperature: 0.1
       });
       return Response.json({ text });
    }

    // Streaming conversational response
    const result = await streamText({
      model: groq.chat('llama3-8b-8192'),
      messages,
      temperature: 0.7,
    });

    // Returns a pure text stream without any SSE/data: prefixes
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Cloud API Error:", error);
    return new Response('Cloud Engine Error', { status: 500 });
  }
}
