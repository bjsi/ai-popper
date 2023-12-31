<h1 align="center">
    <img src="https://raw.githubusercontent.com/bjsi/ai-popper/main/img/ai-popper-logo.jpg" alt="AI Popper Logo" height="200">
    <br/>
    AI Popper - 💬 Chat with AI Karl Popper and David Deutsch
</h1>

<h3 align="center">Chat with David Deutsch, Karl Popper and other Critical Rationalists using GPT. Answers include footnotes to the original sources!</h3>

<br/>

## 🚀 Overview

Welcome to AI Popper, a chatbot I built with GPT to help me learn more about [critical rationalism](https://en.wikipedia.org/wiki/Critical_rationalism). I've been using it to chat with AI versions of David Deutsch and Karl Popper, and it's been a lot of fun. I hope you enjoy it too!

### ✨ Features

- **AI-powered Chatbot**: Chat with AI Karl Popper and David Deutsch.
- **Footnotes to Sources**: Every answer includes footnotes to original sources from books, articles, websites and videos.
- **Audio Playback**: Optionally listen to answers in the voice of David Deutsch instead of reading them.

<div align="center">
  <img src="https://raw.githubusercontent.com/bjsi/ai-popper/main/img/define-optimism.png" alt="Define Optimism" height="400px">
</div>

### 📽️ Tutorial

- You can try out AI Popper online [here](https://ai-popper-chat.onrender.com/). No need to install anything, just enter your OpenAI key and it should work.

## How it Works

AI Popper is built using OpenAI's GPT chat models and text embeddings. Here's the full breakdown of how it works:

1. I downloaded a large number of resources related to critical rationalism, including books, articles, websites and videos.
2. I split each resource into paragraphs and fed each paragraph into OpenAI's text embedding model to create an embedding for each paragraph. An embedding is a vector of numbers that represents the meaning of the text.
3. When you ask a question, I generate a hypothetical answer using OpenAI's `gpt-3.5-turbo-instruct` model and create an embedding for that answer.
4. Then I compare the embedding of the hypothetical answer to the embeddings of all the paragraphs. I pick the closest embeddings and give those paragraphs to GPT-4 to generate a real answer with footnotes.
5. As GPT-4 streams the answer, I send it to ElevenLabs to read the answer in the voice of David Deutsch.

## How to Run

- You can run this program locally using a chat UI similar to the ChatGPT UI, or you can use the command line interface.

### Prerequisites

- You must have [Node.js](https://nodejs.org/en/) installed.
- You must have [Yarn](https://yarnpkg.com/) installed.
- Run `yarn install` to install dependencies.
- Create a `.env` file in the `packages/ui/server` directory with an `OPENAI_API_KEY` variable set to your OpenAI API key.

### UI

- `yarn server` to start the server.
- `yarn client` to start the frontend and open the chat UI in your browser.

### CLI

- `yarn chat` to start a new chat session.
- `yarn search` to start a text embedding search session (useful for debugging).
- `yarn update` to download transcripts for the latest videos in the tracked resources file (see `sources.json`).
  - You must install [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) to download transcripts for new videos.
- `yarn embed` to create embeddings from the latest transcripts.
