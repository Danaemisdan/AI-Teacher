import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Mock streaming response for backend API
        const stream = new ReadableStream({
            async start(controller) {
                const text = "[NOTE] This is a mock response from the ApiContentProvider. [/NOTE]";
                const encoder = new TextEncoder();
                
                for (let i = 0; i < text.length; i++) {
                    controller.enqueue(encoder.encode(text[i]));
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
                
                controller.close();
            }
        });
        
        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (e) {
        return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
    }
}
