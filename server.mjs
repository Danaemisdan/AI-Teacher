import express from 'express'
import cors from 'cors'
import { chromium } from 'playwright'
import { getLlama, LlamaChatSession, LlamaJsonSchemaGrammar } from "node-llama-cpp"
import fs from "fs"
import path from "path"

const app = express()
app.use(cors())
app.use(express.json())

const MODEL_PATH = "/Users/sanjeevn/Downloads/Momentum AI/momentum-engine-3b.gguf"
let llamaInstance = null;
let modelInstance = null;
let globalContext = null;

async function initLlama() {
  if (modelInstance) return { model: modelInstance, context: globalContext, llama: llamaInstance };
  if (!fs.existsSync(MODEL_PATH)) throw new Error("GGUF Missing")
  console.log('[NODE] Booting GGUF...')
  llamaInstance = await getLlama({ gpu: "auto" });
  modelInstance = await llamaInstance.loadModel({ modelPath: MODEL_PATH })
  console.log('[NODE] GGUF Ready.')
  return { model: modelInstance, llama: llamaInstance }
}

let globalBrowser = null;
const gracefulShutdown = async () => {
    if (globalBrowser) {
        console.log("OS Terminate hook fired. Nuking Playwright bounds...");
        await globalBrowser.close().catch(() => {});
        globalBrowser = null;
    }
    process.exit(0);
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', async (error) => {
    console.error("Uncaught exception!", error);
    await gracefulShutdown();
});

const performScrape = async (query, onFrame, onStatus) => {
  try {
    const browser = await chromium.launch({ 
       headless: true, 
       channel: 'chrome',
       args: [
         '--disable-blink-features=AutomationControlled',
         '--no-sandbox',
         '--disable-setuid-sandbox',
         '--disable-infobars',
         '--window-size=1920,1080',
         '--disable-gpu'
       ]
    });
    globalBrowser = browser;
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    // Natively destroy headless bot tracking
    await context.addInitScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");
    const page = await context.newPage()

    const snap = async () => {
      try {
        const buffer = await page.screenshot({ type: 'jpeg', quality: 70, timeout: 2500 })
        onFrame(buffer.toString('base64'))
      } catch (e) {}
    }

    // Absolute load lock to fix the white screen bug natively
    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null)
    await snap()
    
    // Wait for either the modern or HTML snippet result nodes to populate
    await page.waitForSelector('.result__snippet, .result-snippet, [data-testid="result"]', { timeout: 15000 }).catch(() => null)
    
    // VISUAL DOM LABELING INJECTOR
    const domLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a.result__url, a.result__a, .result__title a, [data-testid="result-title-a"], [data-testid="result"] h2 a')).slice(0, 5);
        return links.map((el, index) => {
            el.style.border = '2px solid red';
            let badge = document.createElement('span');
            badge.innerText = ` [LINK ${index}] `;
            badge.style.backgroundColor = 'red';
            badge.style.color = 'white';
            badge.style.fontSize = '12px';
            badge.style.fontWeight = 'bold';
            el.prepend(badge);
            
            let h = el.href;
            try {
                if (h.includes('uddg=')) {
                    h = decodeURIComponent(new URL(h).searchParams.get('uddg'));
                } else if (h.includes('rut=')) {
                    h = decodeURIComponent(new URL(h).searchParams.get('rut'));
                } else if (h.includes('ad_domain=')) {
                    h = "https://" + decodeURIComponent(new URL(h).searchParams.get('ad_domain'));
                }
            } catch(e) {}
            
            return { id: index, href: h, text: el.innerText };
        }).filter(link => link.href && !link.href.includes('duckduckgo.com') && !link.href.includes('microsoft.com'));
    });

    await page.waitForTimeout(1000)
    await snap()

    // OMNI-SCRAPE: Gather top 5 market listings from the search engine instantly
    const marketListings = await page.evaluate(() => {
        const results = Array.from(document.querySelectorAll('.result, [data-testid="result"]')).slice(0, 6);
        return results.map(node => {
             const titleNode = node.querySelector('.result__title, h2, [data-testid="result-title-a"]');
             const snippetNode = node.querySelector('.result__snippet, [data-testid="result-snippet"]');
             return {
                 title: titleNode ? titleNode.innerText : 'Unknown Product',
                 snippet: snippetNode ? snippetNode.innerText : '',
                 source: 'DuckDuckGo Market Search'
             }
        }).filter(n => n.title.length > 5);
    });

    // Agentically select up to 8 high-value links from the DOM array to construct local situational memory memory 
    let targetLinks = domLinks.slice(0, 8);
    
    // Capture native DuckDuckGo frame before exploding 8 concurrent Playwright tabs which silently zeros out the OS compositor buffers for unfocused tabs, causing the white-screen glitch.
    const finalBuffer = await page.screenshot({ type: 'jpeg', quality: 90, timeout: 3000 }).catch(()=>null);
    if (finalBuffer) onFrame(finalBuffer.toString('base64'));

    let deepScanResults = [];

    // PHYSICAL OMNI-CRAWLER: Execute 8 background tabs concurrently! 
    onStatus('Evaluating 8 Target Vendors Concurrently...');

    const scrapePromises = targetLinks.map(async (linkData) => {
        if (!linkData || !linkData.href || linkData.href.length < 5) return null;
        
        let subPage = null;
        try {
            subPage = await context.newPage();
            // 8 seconds concurrent bounding
            const navRes = await subPage.goto(linkData.href, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => null);
            if (!navRes) return null;
            
            // Hard pause to allow heavy SPA (React/Vue) e-commerce pricing skeletons to fully hydrate
            await subPage.waitForTimeout(1800);

            const deepResult = await subPage.evaluate(() => {
                let priceLine = 'Check Vendor directly';
                const allText = document.body.innerText || "";
                const priceMatch = allText.match(/(\$|₹)\d+(,\d{3})*(\.\d{2})?/);
                if (priceMatch) priceLine = priceMatch[0];
                
                const specs = Array.from(document.querySelectorAll('p, li, h2, h3, .product-description, article'))
                    .map(node => node.innerText.trim().replace(/\n/g, ' '))
                    .filter(txt => txt.length > 50 && txt.length < 1000 && !txt.toLowerCase().includes('cookie') && !txt.toLowerCase().includes('javascript'))
                    .slice(0, 4)
                    .join(' | ');

                const fallbackImg = Array.from(document.querySelectorAll('img')).find(img => img.width > 200 && img.height > 200);
                return { title: document.title || 'Market Item', link: window.location.href, price: priceLine, image: fallbackImg ? fallbackImg.src : null, key_specs: specs }
            });
            
            // Restore visual feedback monitor emission (React stream clipping is permanently fixed)
            const subBuffer = await subPage.screenshot({ type: 'jpeg', quality: 50, timeout: 2000 }).catch(()=>null);
            if (subBuffer) onFrame(subBuffer.toString('base64'));

            return deepResult;
        } catch (e) {
            return null;
        } finally {
            if (subPage) await subPage.close().catch(()=>null);
        }
    });

    const concurrentResults = await Promise.all(scrapePromises);
    deepScanResults = concurrentResults.filter(Boolean);

    await context.close().catch(()=>null);
    
    // Combine the 5 market listings with the deep multi-vendor analysis
    return [...deepScanResults, ...marketListings].filter(Boolean);

  } catch (error) {
    console.error('Playwright Error:', error)
    return []
  } finally {
    // DO NOT TEARDOWN GLOBAL BROWSER TO PREVENT MAC ZOMBIE PORT LOCKOUTS! 
    // globalBrowser sits warm and persistent automatically.
  }
}

app.post('/api/chat', async (req, res) => {
  const { query, history = [] } = req.body

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  const emit = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)

  let contextData = ""
  let isAgentic = false;
  let routerQueryTarget = query;
  
  let routerSequence = null;
  let finalSequence = null;
  let jsonSequence = null;
  
  let routerSession = null;
  let finalSession = null;
  let jsonSession = null;
  let requestContext = null;
  
  try {
    const { model, llama } = await initLlama()
    
    // Boot a pristine, physically isolated Context Block (KV Cache) to eliminate native C++ Memory sequence overflows on back-to-back agent queries
    requestContext = await model.createContext({ contextSize: 5500, threads: 4 });

    // ---------------------------------------------------------
    // STAGE 1: HYBRID ROUTER (Deterministic Firewall + LLM)
    // ---------------------------------------------------------
    emit('status', 'Evaluating intent parameters...')
    
    // DETERMINISTIC FIREWALL: Only block instantly if this is the FIRST message and extremely short. 
    // If we are deep in conversation (history > 0), let the router evaluate "Yes" or short answers.
    const isBasicChat = history.length === 0 && query.length < 15 && !/(buy|find|search|get|show|phone|laptop|price|specs|check)/i.test(query);

    if (isBasicChat) {
        // Skip LLM parsing completely. It's a brand new "What's up" or "Hey"
        isAgentic = false;
    } else {
        const routerGrammar = new LlamaJsonSchemaGrammar(llamaInstance, {
            type: "object",
            properties: {
                requiresWebSearch: { type: "boolean" },
                targetProductString: { type: "string" }
            },
            required: ["requiresWebSearch", "targetProductString"]
        });

        // Pull the last agent message to give the router context for short answers ("Yes")
        const lastAgentText = history.length > 0 && history[history.length - 1].role === 'agent' ? history[history.length - 1].text : "";

        const routerPrompt = `You are a binary intent search trigger. You MUST be extremely aggressive. If the user mentions preferences, products, or continues a shopping dialogue (e.g. answering "yes", "sure", "do it"), you MUST output requiresWebSearch: true.
Crucially, when true, targetProductString MUST explicitly use the PREVIOUS AGENT MESSAGE CONTEXT to know exactly what product to search for.
The "targetProductString" parameter MUST be a highly optimized search query to find WHERE TO BUY the item (e.g. naturally append words like "buy online", "price", "reviews", or "amazon"). DO NOT just output the raw product name.

EXAMPLES:
Context: "Would you like me to checkout the Nike shoes?"
User: "Sure" -> {"requiresWebSearch": true, "targetProductString": "Nike shoes buy online latest price"}

Context: "I found some digital cameras."
User: "I wanna break my bank" -> {"requiresWebSearch": true, "targetProductString": "most expensive ultra luxury digital cameras online shop best price"}

PREVIOUS AGENT MESSAGE CONTEXT: "${lastAgentText}"
User: "${query}" ->`

        routerSequence = requestContext.getSequence();
        routerSession = new LlamaChatSession({ contextSequence: routerSequence, systemPrompt: "You are a strict JSON categorizer. You must evaluate intent according to the provided examples." })
        
        let routerDecision = ""
        await routerSession.prompt(routerPrompt, { 
            grammar: routerGrammar, 
            onTextChunk(c) { routerDecision += c; }
        })
        
        try {
            const parsedRouter = JSON.parse(routerDecision.trim());
            if (parsedRouter.requiresWebSearch) {
                isAgentic = true;
                if (parsedRouter.targetProductString && parsedRouter.targetProductString.length > 2) {
                    routerQueryTarget = parsedRouter.targetProductString;
                }
            }
        } catch(e) {}
        
        // Immediately release token sequence back to the context pool
        if (routerSession) routerSession.dispose();
        if (routerSequence) routerSequence.dispose();
        routerSession = null;
        routerSequence = null;
    }

    // ---------------------------------------------------------
    // STAGE 2: VISUAL SCRAPE & DOM LABELING
    // ---------------------------------------------------------
    if (isAgentic) {
      emit('mode', 'agentic')
      emit('status', 'Optic network scanning DOM vectors...')
      const scraped = await performScrape(routerQueryTarget, (b64) => emit('frame', b64), (statusStr) => emit('status', statusStr))
      emit('status', 'Visuals labeled. Extracting node data...')
      // LLM Token Guard: Structurally map the array into a dense primitive text block to completely bypass `node-llama-cpp` sequence token limits and C++ KV Cache segfault blocks natively.
      const compressedString = (scraped || []).map(entry => `Product: ${entry.title?.slice(0,60)} | Price: ${entry.price} | Source: ${entry.link?.slice(0, 50)} | Top Specs: ${entry.key_specs?.slice(0, 150)}`).join('\n\n');
      contextData = compressedString.substring(0, 4500);
    } else {
      emit('mode', 'conversational')
    }

    // ---------------------------------------------------------
    // STAGE 3: PRIMARY OUTPUT / CONVERSATION FIX
    // ---------------------------------------------------------
    let conversationState = '';
    // Deep Context Retention: Inject the last 2 highly-truncated turns so the 3B model maintains conversational continuity without crashing from massive KV repeating sequence EOS loops.
    if (history.length > 0) {
        const recentHistory = history.slice(-2);
        conversationState = `\n--- RECENT CONTEXT ---\n` + recentHistory.map(h => `${h.role === 'user' ? 'Client' : 'Agent'}: ${h.text.substring(0, 300)}${h.text.length > 300 ? '...' : ''}`).join('\n') + `\n----------------------\n`;
    }

    const systemPrompt = `You are Nexmart, an elite personal shopping chauffeur. The current year is 2026. Your internal world knowledge ends in 2023, so you must rely on the live market data you just scraped. Act like a high-end concierge. You physically do the shopping for the user. Do not be overly formal or "luxury proxy", be human, reliable, and deeply analytical.
${conversationState}

Client Request: "${query}"

${isAgentic ? 
  `CRITICAL PROCUREMENT MISSION:
1. You just executed a deep-web omni-scrape. The following array contains up to 8 market features you physically pulled from the internet:
${contextData}
2. BE BRIEF AND HIGHLY USEFUL. Compare the prices across platforms dynamically. Directly state what product offers the best "value for money". If specs or performance variations exist, name them sharply.
3. ABSOLUTE ZERO-HALLUCINATION RULE: If a specific option from the scraped text does not contain a dollar/rupee amount natively, YOU MUST NOT GUESS OR INVENT A PRICE. You must simply declare "Check Vendor". 
4. Include explicit physical source URLs directly in your text when recommending the product (e.g. "Available here: https...").
5. Speak to the user natively, compare the items directly, and ask if they'd like you to physically initiate the checkout loop.` : 
  `CRITICAL MISSION RULE: Act as an elite personal shopping chauffeur. Talk to the user cleanly and humanly. If the user asks about a modern product, tell them you can 'go search for it' on your next turn.`}`

    finalSequence = requestContext.getSequence();
    finalSession = new LlamaChatSession({
      contextSequence: finalSequence,
      systemPrompt: systemPrompt
    })

    let fullText = ""

    await finalSession.prompt(query, {
      onTextChunk(chunk) {
        let cleanChunk = chunk;
        if (cleanChunk.includes(query)) cleanChunk = cleanChunk.replace(query, '');
        fullText += cleanChunk;
        emit('token', cleanChunk);
      }
    })
    
    if (finalSession) finalSession.dispose();
    if (finalSequence) finalSequence.dispose();
    finalSession = null;
    finalSequence = null;

    if (isAgentic) {
      try {
        const productGrammar = new LlamaJsonSchemaGrammar(llamaInstance, {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    price: { type: "string" },
                    source: { type: "string" },
                    url: { type: "string" },
                    image: { type: "string" }
                },
                required: ["id", "title", "price", "url"]
            }
        });
        
        jsonSequence = requestContext.getSequence();
        jsonSession = new LlamaChatSession({
            contextSequence: jsonSequence,
            systemPrompt: "You are a rigid structural extractor. Extract exactly the top 3 products mentioned in the context into the JSON array."
        });
        
        let jsonRes = "";
        await jsonSession.prompt(`Context: ${contextData}\nExtract top 3 items to JSON.`, {
            grammar: productGrammar,
            onTextChunk(c) { jsonRes += c; }
        });
        
        const parsed = JSON.parse(jsonRes.trim());
        emit('products', parsed);
      } catch(e) {}
    }

    emit('done', true)
    
  } catch (error) {
    console.error('[CORE] LLM Execution Error:', error);
    emit('token', 'Engine offline. Core systems halted.')
    emit('done', true)
  } finally {
    if (routerSession) routerSession.dispose();
    if (finalSession) finalSession.dispose();
    if (jsonSession) jsonSession.dispose();
    
    if (routerSequence) routerSequence.dispose();
    if (finalSequence) finalSequence.dispose();
    if (jsonSequence) jsonSequence.dispose();
    if (requestContext) await requestContext.dispose();
    
    res.end()
  }
})

app.listen(3001, () => {
  console.log('[Nexmart V10] LlamaSchema Routing & DOM Labeler active on Port 3001')
})
