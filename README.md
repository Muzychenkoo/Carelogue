# Carelogue

A voice-enabled care passport for your child. Build a structured guide that any new caregiver can read or listen to — sleep schedules, foods tried, how to settle, routines, medical info, and emergency contacts.

## Features

- **Structured sections** — Sleep, food, settling, daily routine, medical, communication, and emergency contacts
- **Completion tracking** — See what's filled in and what's still missing
- **Voice input** — Tap the microphone on any field, or use "Guide me" to fill gaps one question at a time
- **Voice output** — Read the entire passport aloud to a new caregiver, or read individual sections
- **Prompts missing info** — The app tells you exactly which fields are empty and walks you through them
- **Local storage** — All data stays on your device; nothing is sent to a server

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Voice support

Voice input and output use the browser's Web Speech API. For best results, use **Chrome** or **Edge** on desktop or mobile. You'll need to allow microphone access when prompted.

## Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- Web Speech API (STT + TTS)
- localStorage persistence
