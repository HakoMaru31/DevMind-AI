# DevMind AI

**DevMind AI** is an open-source, multi-provider AI coding assistant prototype built with React and Vite.

It provides a unified workspace for experimenting with different AI providers and models, attaching screenshots/files to conversations, browsing imported project files, and using coding-focused quick actions.

> **Project status:** Early-stage / experimental. The repository is intentionally transparent about its current scope: it is a working frontend prototype, not a production IDE or a secure hosted AI gateway.

## Features

- Multi-provider chat architecture with OpenAI-compatible, OpenAI, Groq, and Anthropic adapters.
- Add custom models and OpenAI-compatible endpoints from the UI.
- Session-only API key handling: keys are not written to localStorage by the application.
- Markdown-style assistant rendering with fenced code blocks and copy actions.
- Image and text-file attachments.
- Import a project directory in supported browsers and inspect text files in the workspace.
- Coding quick actions: explain code, fix bugs, and review code.
- Responsive dark developer-focused UI.

## Security model

This frontend can call provider APIs directly when a provider allows browser requests. **Any API key entered into a browser is exposed to the browser session and should be treated as a user-controlled credential.** DevMind AI does not persist keys to localStorage, but this does not make client-side provider calls suitable for shared or production environments.

For production use, place provider credentials behind a server-side proxy/gateway, add authentication and rate limiting, and keep secrets out of the browser entirely.

Never commit `.env`, provider secrets, service-account keys, or personal credentials.

## Getting started

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

Production build:

```bash
npm run build
npm run preview
```

## Provider configuration

Open **Models** in the sidebar and select a model. Built-in model entries are examples and may need their model IDs or endpoints updated as providers change their APIs.

For OpenAI-compatible providers, provide the provider's base URL and model ID. Browser CORS support depends on the provider.

## Importing a project

Open **Files → Import Project** and choose a project directory in a browser that supports directory uploads. Only files selected by the user are loaded into browser memory; DevMind AI does not silently access the local filesystem.

## Roadmap

- Server-side provider gateway for production-safe secret handling.
- Streaming responses.
- Persistent chat history with explicit user-controlled storage.
- Better code intelligence and project context retrieval.
- Git integration and patch/diff workflows.
- Tool calling and agentic coding workflows.
- Automated tests and CI.

## License

MIT. See [LICENSE](./LICENSE).
