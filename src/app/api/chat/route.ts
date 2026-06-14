import { searchDuckDuckGo } from '@/lib/scraper'
import { promptGGUF } from '@/lib/gguf-runner'

// Must export logic as POST for SSE stream initialization
export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const emit = (event: string, data: any) => {
          try {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          } catch (e) {
            // Stream might have closed prematurely
          }
        }

        emit('status', 'Agent deploying Web Scraper Protocol...');
        
        // 1. Scrape with Live Framerate Streaming
        const scrapedData = await searchDuckDuckGo(`${query} price buy online`, (b64) => {
          emit('frame', b64);
        });

        if (!scrapedData || scrapedData.length === 0) {
          emit('token', 'I attempted a sweep but my sensors were blocked. No products found.');
          controller.close();
          return;
        }

        emit('status', 'Data secured. Analyzing via Momentum Engine...');
        emit('frame', 'DONE'); // Signal visor to go into standby

        // 2. Synthesize with Native GGUF
        const promptContext = scrapedData.map(d => `Title: ${d.title}\nDesc: ${d.snippet}\nURL: ${d.link}`).join('\n\n');
        
        const systemPrompt = `You are Nexmart, an elite, hyper-intelligent autonomous commerce agent.
        The user asked: "${query}".
        You have scraped these local products:
        ${promptContext}

        Acknowledge their request briefly in a sophisticated tone, stating exactly what you synthesized. 
        Then, YOU MUST END YOUR RESPONSE WITH A VALID JSON ARRAY OF 2 SELECTED PRODUCTS in this exact format:
        [
          {"id": "1", "title": "...", "price": "...", "source": "...", "url": "..."}
        ]
        Do not wrap the JSON in Markdown code blocks. Just plain text then JSON array.`;

        let fullText = "";
        
        try {
          await promptGGUF(systemPrompt, `User Request: ${query}`, (chunk: string) => {
            fullText += chunk;
            emit('token', chunk);
          });
        } catch (e: any) {
           console.error('GGUF failed:', e);
           // Fallback if GGUF throws
           emit('token', 'GGUF Engine failure. Rendering raw results...');
           fullText = `[{"id":"99","title":"${scrapedData[0].title}","price":"View Details","source":"Scraper Fallback","url":"${scrapedData[0].link}"}]`
        }

        // Try extracting JSON at the end
        try {
          const match = fullText.match(/\[[\s\S]*\]/);
          if (match) {
            const products = JSON.parse(match[0]);
            emit('products', products);
          }
        } catch(e) {
          console.error("Agent failed to output valid JSON subset");
        }

        emit('done', true);
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'System Failure' }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}
