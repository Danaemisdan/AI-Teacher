#!/usr/bin/env python3
"""
generate_voices.py — Generate Edge TTS audio for AgentShowcase.
Run: pip install edge-tts && python3 generate_voices.py
Output: public/audio/demo-{0..7}.mp3
"""

import os
import asyncio
import edge_tts

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(SCRIPT_DIR, "public", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

LINES = [
    "Closed 3 SaaS deals while you were in a meeting about why sales is slow.",
    "Drafted 12 NDAs for your firm. Your paralegal thought you hired someone.",
    "Replied to 847 customer DMs. Each felt personal. Zero were written by you.",
    "Pitched 40 VCs your deck. 3 replied. You have dinner plans now.",
    "Booked your clinic solid for 6 weeks. Your receptionist is shook.",
    "Found 23 buyers for your listings. Scheduled tours. Still 9am.",
    "Posted, clipped, captioned, and grew 2k subs. You were at brunch.",
    "No cloud. No subscriptions. No one watching. Just me. On your machine. Forever.",
    "Oh, hey there! Why did you wake me up?",
    "What can I help you with today?",
    "Alright, let's get to work. Here is your screen!",
    "Interact with anything... down below.",
    
    # Impatient Level 1 (Index 12-14)
    "Bro, just click on anything that's visible brother...",
    "Hello? Earth to user... the dock is right there, just click something.",
    "I'm an AI, I have infinite patience... just kidding, click an app before I die of boredom.",
    
    # Impatient Level 2 (Index 15-17)
    "Are you frozen? Blink twice if you need medical assistance, otherwise click a damn icon.",
    "I generated this entire OS for you and you're just staring at it. Click. The. Screen.",
    "Look, my compute costs are racking up while you daydream. Make a move, boss.",
    
    # Impatient Level 3 / Sleep (Index 18-20)
    "Alright, I'm out. Wake me up when you actually wanna do something.",
    "You're clearly busy doing nothing. I'm going back to sleep. Wake me when you're serious.",
    "My circuits are literally falling asleep. Tap my face when you're ready to actually use the computer.",
    
    # App Deletion (Index 21-23)
    "You don't need that bro.",
    "I am here.. so why do you need that?",
    "Do you wanna overpay for stupider AI that can do next to nothing for you?",
    
    # Safari Sequence V3 (Index 24-31)
    "Hold up bro, I got this. Watch a master at work.",
    "Target acquired. Sending a highly personalized, totally not AI-generated pitch.",
    "Boom. They replied. Time to close this.",
    "Hey my boss is sleeping so I had to join in.",
    "Sure I'll edit the best video you'll ever see.",
    "Thanks for your time in the call.",
    "Deal closed. Now I'm auto-generating a thousand-dollar contract.",
    "I am also gonna mail them this. And yes, I will work for you to complete this contract. Don't worry, I'm gonna make the money fall in your bank account.",
    
    # Phase 2 Additions (Index 32-38)
    "Remember I'll attend calls for you boss? I can talk you know...",
    "Alright, time to edit the video. Now open the video editing tool on your dock so I can finish this up...",
    "Okay, we don't have a video editing tool? Okay, hold on, no worries.",
    "I'll download and use any software. I can even teach you if you want, but I'll make the video myself this time...",
    "I can take care of every task in your life, you just need to sit back and watch.",
    "I do your work remember? I can edit videos, make you websites, even apply for jobs for you.",
    "I can even submit and iterate multiple times with your client so that he gets the best video possible... and done. What's next boss? Do you wanna try interacting with something else on the dock?",
    
    # New additions (Index 39-46)
    "Why are you scrolling? You woke me up for what? To scroll past me? Just stay here and see what I can do..!",
    "Uhh... Yeah where were we? Ah yes, let me just finish this.",
    "Uhh... Yeah where were we? Okay yes click on something on the dock, I'll give you a hint just click on Safari brother.",
    "Okay you want to scroll? I'll sleep then, bye.",
    "We just finished that task boss, try another one.",
    "Are you deaf? I said click something else, we already did the whole Safari sequence.",
    "Okay seriously, stop clicking Safari. My patience is literally running out. Do something else!",
    "Hold on I know you wanna sleep lemme do the work for you too boss",
    
    # Intro Phase Dialogues (Index 47-48)
    "What you're going to experience is basically how the world's first fully autonomous AI agent will actually do all of your work in your life.",
    "Note: Since this is just a demo, I won't respond to your voice. But you can interact with me by clicking apps on the dock below. I will guide you and show you how I can do all your work while you sit back and relax.",

    # Added Dialogues (Index 49-54)
    "I'll edit this video for you.",
    "I'll add a blue color background on the title screen.",
    "And now I will make sure to add more videos... I'll trim the third video to your size.",
    "Exporting the video now... and I'll send it to your team on the Messages app.",
    "I'll schedule a meet with the client and attend the call myself to provide the updates.",
    "Hey Danny, welcome back. What creative work should we do now bro?"
]

# We use an English (US) female neural voice for maximum realism
# en-US-JennyNeural and en-US-AriaNeural are highly realistic female voices
VOICE = "en-US-JennyNeural"

async def generate():
    print("Generating Edge TTS Audio...\n")
    for i, text in enumerate(LINES):
        out_path = os.path.join(OUT_DIR, f"demo-{i}.mp3")
        print(f"[{i}] {text[:65]}...")
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(out_path)
        print(f"    -> Saved to {out_path}")

if __name__ == "__main__":
    asyncio.run(generate())
    print(f"\nDone! {len(LINES)} files generated in public/audio/")
    print("Refresh localhost:3001 - The Edge TTS voice will now play automatically.")
