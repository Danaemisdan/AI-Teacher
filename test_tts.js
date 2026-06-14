import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

(async () => {
    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata("en-US-AriaNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const stream = tts.toStream("Hello world");
        console.log("Stream obtained?", !!stream);
        
        let chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => console.log("Stream ended, total chunks:", chunks.length));
        stream.on('error', (err) => console.error("Stream error:", err));
        
    } catch(e) {
        console.error("Caught error:", e);
    }
})();
