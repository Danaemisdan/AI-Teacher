import os
import asyncio
import edge_tts

TEXT = "Pause. So the agent doesn't actually speak back to you... if you're that dumb. Also, you can just interact with me by opening apps on the dock, and I will explain how I help you do anything without lifting a finger. Now, continue."
VOICE = "en-US-JennyNeural"
OUT = "public/audio/demo-47.mp3"

async def gen():
    communicate = edge_tts.Communicate(TEXT, VOICE)
    await communicate.save(OUT)

asyncio.run(gen())
print("Generated demo 47")
