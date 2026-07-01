# AI School

An interactive AI-powered learning environment built with Next.js, WebLLM, and Momentum

## Overview

AI School replaces traditional learning by pairing students with an interactive VTuber AI Teacher. The AI logic runs entirely in your browser using **WebLLM**, ensuring high privacy and low latency, while **Open-LLM-VTuber** provides a compelling visual representation of the teacher.

## Tech Stack

- **Next.js**: React framework for the frontend.
- **WebLLM**: In-browser LLM execution powered by WebGPU.
- **Open-LLM-VTuber**: 3D avatar rendering and animation.
- **Tailwind CSS**: Styling.
- **Framer Motion**: UI Animations.

## Prerequisites

- Node.js 18+
- A modern browser with **WebGPU support** (e.g., Chrome).

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

The project contains the following core components:
- `src/components/`: Reusable UI components.
- `src/app/`: Next.js App Router pages.
- The VTuber interface will be integrated to handle audio and facial animations, communicating directly with the WebLLM instance running in a web worker.
