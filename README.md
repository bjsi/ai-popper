# AI Popper

- Chat with David Deutsch, Karl Popper and Brett Hall using GPT.

## Features

- This repo contains text embeddings for lots of critical rationalism resources.
- There's also chat bot prompts to get GPT to respond in the style of David Deutsch and quote from resources like Brett Hall's podcast.

## Requirements

- You must install `yt-dlp` to download transcripts for new videos.
- You must create a `.env` file in the project root with an `OPENAI_API_KEY` variable.

## How to Run

- `yarn run chat` to start a new chat session.

You probably don't need to run these, I'll keep them up to date and push here!

- `yarn run update` to download transcripts for the latest videos in the tracked channels (see `sources.json`).
- `yarn run embed` to create embeddings from the latest transcripts.
