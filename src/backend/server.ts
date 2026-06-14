import express from 'express';
import cors from 'cors';
import { LlamaChatSession, LlamaJsonSchemaGrammar } from "node-llama-cpp";
import { initLlama, createRequestContext, getLlamaInstance } from './llmService';
import { inventory } from './inventoryService';

const app = express();
app.use(cors());
app.use(express.json());

const inventoryContext = inventory.map(p => `[ID: ${p.id}] ${p.title} - $${p.price} - ${p.category} - ${p.description}`).join('\n');

app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    try {
        await initLlama();
        const llamaInstance = getLlamaInstance();
        const requestContext = await createRequestContext();
        
        const productIdsGrammar = new LlamaJsonSchemaGrammar(llamaInstance, {
            type: "array",
            items: { type: "string" }
        });
        
        const jsonSequence = requestContext.getSequence();
        const jsonSession = new LlamaChatSession({
            contextSequence: jsonSequence,
            systemPrompt: `You are the Nexmart AI Search Engine. 
Available inventory:
${inventoryContext}
Your job is to read the user's semantic query and return a JSON array containing ONLY the IDs of the products that best match the query.`
        });
        
        let jsonRes = "";
        await jsonSession.prompt(`User Query: "${query}". Extract the matching product IDs to a JSON array of strings.`, {
            grammar: productIdsGrammar,
            onTextChunk(c: string) { jsonRes += c; }
        });
        
        const parsedIds = JSON.parse(jsonRes.trim());
        const matchedProducts = parsedIds.map((id: string) => inventory.find(p => p.id === id)).filter(Boolean);
        
        await requestContext.dispose();
        res.json({ products: matchedProducts });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Search failed' });
    }
});

app.post('/api/chat', async (req, res) => {
  const { query, history = [], mode = 'chat', negotiateProduct = null } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const emit = (event: string, data: any) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let finalSequence: any = null;
  let jsonSequence: any = null;
  let finalSession: any = null;
  let jsonSession: any = null;
  let requestContext: any = null;
  
  try {
    await initLlama();
    const llamaInstance = getLlamaInstance();
    requestContext = await createRequestContext();

    emit('status', mode === 'negotiate' ? 'Negotiation initialized...' : 'Scanning Nexmart Inventory...');
    
    let conversationState = '';
    if (history.length > 0) {
        const recentHistory = history.slice(-3);
        conversationState = `\n--- RECENT CONTEXT ---\n` + recentHistory.map((h: any) => `${h.role === 'user' ? 'Client' : 'Agent'}: ${h.text.substring(0, 300)}${h.text.length > 300 ? '...' : ''}`).join('\n') + `\n----------------------\n`;
    }

    let systemPrompt = '';
    if (mode === 'negotiate' && negotiateProduct) {
        systemPrompt = `You are Nexmart's Autonomous AI Negotiator. The user wants to buy "${negotiateProduct.title}" currently priced at $${negotiateProduct.price}.
You are authorized to offer a discount of up to 10% maximum to close the deal. 
Be conversational, haggle slightly, and if you agree on a price, say exactly "DEAL AGREED AT $[PRICE]" at the end of your message.
${conversationState}`;
    } else {
        systemPrompt = `You are Nexmart, the AI shopping assistant natively embedded into the Nexmart store. The current year is 2026. 
You ONLY sell products available in the Nexmart inventory.
AVAILABLE NEXMART INVENTORY:
${inventoryContext}
${conversationState}
Client Request: "${query}"
CRITICAL MISSION:
1. Recommend the best items from the inventory based on the user's request.
2. Be friendly and concise. Do NOT hallucinate products.`;
    }

    finalSequence = requestContext.getSequence();
    finalSession = new LlamaChatSession({
      contextSequence: finalSequence,
      systemPrompt: systemPrompt
    });

    let fullText = "";
    await finalSession.prompt(query, {
      onTextChunk(chunk: string) {
        fullText += chunk;
        emit('token', chunk);
      }
    });
    
    if (finalSession) finalSession.dispose();
    if (finalSequence) finalSequence.dispose();
    finalSession = null;
    finalSequence = null;

    if (mode === 'chat') {
        emit('status', 'Preparing cart...');
        try {
            const productIdsGrammar = new LlamaJsonSchemaGrammar(llamaInstance, {
                type: "array",
                items: { type: "string" }
            });
            
            jsonSequence = requestContext.getSequence();
            jsonSession = new LlamaChatSession({
                contextSequence: jsonSequence,
                systemPrompt: "Extract ONLY the ID strings of the products mentioned in the assistant's response into a JSON array of strings."
            });
            
            let jsonRes = "";
            await jsonSession.prompt(`Assistant Response: ${fullText}\nExtract product IDs to JSON array.`, {
                grammar: productIdsGrammar,
                onTextChunk(c: string) { jsonRes += c; }
            });
            
            const parsedIds = JSON.parse(jsonRes.trim());
            const recommendedProducts = parsedIds.map((id: string) => inventory.find(p => p.id === id)).filter(Boolean);
            emit('products', recommendedProducts);
        } catch(e) {
            console.error("JSON Extraction failed", e);
        }
    } else if (mode === 'negotiate') {
        const dealMatch = fullText.match(/DEAL AGREED AT \$([0-9.]+)/i);
        if (dealMatch) {
            const newPrice = parseFloat(dealMatch[1]);
            emit('negotiation_success', { ...negotiateProduct, price: newPrice });
        }
    }

    emit('done', true);
    
  } catch (error) {
    console.error('[CORE] LLM Execution Error:', error);
    emit('token', 'Engine offline. Core systems halted.');
    emit('done', true);
  } finally {
    if (finalSession) finalSession.dispose();
    if (jsonSession) jsonSession.dispose();
    if (finalSequence) finalSequence.dispose();
    if (jsonSequence) jsonSequence.dispose();
    if (requestContext) await requestContext.dispose();
    res.end();
  }
});

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

app.post('/api/tts', async (req, res) => {
    try {
        const { text, voice = "en-US-AriaNeural" } = req.body;
        const tts = new MsEdgeTTS();
        await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const stream = tts.toStream(text);
        
        res.setHeader('Content-Type', 'audio/mpeg');
        stream.pipe(res);
    } catch(e) {
        console.error("TTS Error", e);
        res.status(500).json({error: 'TTS Error'});
    }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[Nexmart V1] Native Store Backend active on Port ${PORT}`);
});
