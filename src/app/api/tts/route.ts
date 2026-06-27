import { NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export async function GET(req: Request) {
    return handleTTS(req);
}

export async function POST(req: Request) {
    return handleTTS(req);
}

async function handleTTS(req: Request) {
    try {
        let text = '';
        let voice = 'en-US-JennyNeural'; // Highly reliable, natural female voice
        
        if (req.method === 'POST') {
            const body = await req.json();
            text = body.text;
            if (body.voice) voice = body.voice;
        } else {
            const { searchParams } = new URL(req.url);
            text = searchParams.get('text') || '';
            if (searchParams.get('voice')) voice = searchParams.get('voice') as string;
        }

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const tts = new MsEdgeTTS();
        await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        
        // msedge-tts streams back chunks. We need to access the audioStream property
        const result = tts.toStream(text);
        const stream = result.audioStream;
        
        // Convert Node stream to Web ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });
                stream.on('end', () => {
                    controller.close();
                });
                stream.on('error', (err) => {
                    controller.error(err);
                });
            }
        });

        return new Response(webStream, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }
}
