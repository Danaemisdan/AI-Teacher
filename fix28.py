import os
import asyncio
import edge_tts

TEXT = "Sure I'll edit the best video you'll ever see."
VOICE = "en-US-JennyNeural"
OUT = "public/audio/demo-28.mp3"

async def gen():
    communicate = edge_tts.Communicate(TEXT, VOICE)
    await communicate.save(OUT)

asyncio.run(gen())
print("Generated demo 28")
