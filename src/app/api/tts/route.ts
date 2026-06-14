import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { NextResponse } from "next/server";
import { Readable } from "stream";

// Convert Node.js Readable to Web ReadableStream for instant streaming
function streamToWebReadable(nodeStream: Readable) {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', chunk => controller.enqueue(new Uint8Array(chunk)));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', err => controller.error(err));
    }
  });
}

// Changed to GET so we can stream directly into <audio src="..."> with zero delay
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');
    // Using a hyper-natural male voice by default (ChristopherNeural is fantastic)
    const voice = searchParams.get('voice') || "en-US-ChristopherNeural";

    if (!text) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    // This streams the audio *as it is being generated* by Microsoft Edge
    const { audioStream } = tts.toStream(text);
    const webStream = streamToWebReadable(audioStream);

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 500 });
  }
}
