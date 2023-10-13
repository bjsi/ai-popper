# AI Popper

- Chat with David Deutsch, Karl Popper and Brett Hall using GPT.

## Features

- This repo contains text embeddings for lots of critical rationalism resources.
- There's also chat bot prompts to get GPT to respond in the style of David Deutsch and quote from resources like Brett Hall's podcast.

## Requirements

- You must create a `.env` file in the project root directory with an `OPENAI_API_KEY` variable.

## How to Run

You can run this program using a chat UI similar to the ChatGPT UI, or you can use the command line interface.

### UI

- `yarn server` to start the server.
- `yarn client` to start the frontend.

### CLI

- `yarn chat` to start a new chat session.
- `yarn search` to start a text embedding search session (useful for debugging).
- `yarn update` to download transcripts for the latest videos in the tracked resources file (see `sources.json`).
  - You must install `yt-dlp` to download transcripts for new videos.
- `yarn embed` to create embeddings from the latest transcripts.
