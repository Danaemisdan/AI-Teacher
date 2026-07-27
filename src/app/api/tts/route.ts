/**
 * Edge TTS API Route
 * POST /api/tts
 *
 * Body: { text: string; voice?: string; rate?: string; pitch?: string }
 * Returns: audio/mpeg stream
 *
 * Uses Microsoft Edge's neural TTS voices via msedge-tts.
 * Covers 100+ languages, zero user-side download.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const runtime = 'nodejs'; // Must run in Node — WebSocket required

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'en-US-AriaNeural', rate = '+0%', pitch = '+0Hz' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(text);

    // Pipe the TTS stream into a Web Response stream
    const { readable: webReadable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    audioStream.on('data', (chunk: Buffer) => {
      writer.write(new Uint8Array(chunk));
    });

    audioStream.on('end', () => {
      writer.close();
    });

    audioStream.on('error', (err: Error) => {
      console.error('[TTS] Stream error:', err);
      writer.abort(err);
    });

    return new NextResponse(webReadable, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[TTS] Fatal:', err);
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
  }
}
