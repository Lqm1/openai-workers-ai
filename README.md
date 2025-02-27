# OpenAI Workers AI

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Lqm1/openai-workers-ai)

OpenAI Workers AI is an OpenAI-compatible API hosted on Cloudflare Workers. It leverages Cloudflare Workers AI to process and transcribe audio using various Whisper-based models. The project is built with the Hono framework and provides OpenAPI documentation with Swagger UI.

---

## Features

- **Cloudflare Workers Integration:** Leverages Cloudflare's serverless platform for fast and scalable API hosting.
- **OpenAI Compatible API:** Supports endpoints that mimic the OpenAI API for AI functionalities.
- **Audio Transcription:** Implements transcription endpoints that process audio using multiple Whisper models:
  - `@cf/openai/whisper`
  - `@cf/openai/whisper-tiny-en`
  - `@cf/openai/whisper-large-v3-turbo`
- **API Documentation:** Automatically generated OpenAPI documentation available at `/openapi.json` and rendered via Swagger UI at `/docs`.
- **Type Safety & Validation:** Built with TypeScript and uses Zod for schema validation.

---

## Installation

Clone the repository and install the dependencies:

```bash
npm install
```

---

## Local Development

To start a local development server using Wrangler:

```bash
npm run dev
```

---

## Deployment

Deploy your project to Cloudflare Workers with:

```bash
npm run deploy
```

You can also deploy directly using the **Deploy to Cloudflare Workers** button at the top.  
> **Note:** Replace `YOUR_ACCOUNT_ID` in the deploy button URL with your actual Cloudflare account ID.

---

## API Endpoints

### Root Endpoint

- **GET /**  
  Returns a simple greeting message.

### Documentation

- **GET /docs**  
  Renders the Swagger UI documentation for the API.

### Audio Transcription

- **POST /v1/audio/transcriptions**  
  Accepts a multipart/form-data request with the following fields:
  - **file:** Audio file to transcribe.
  - **model:** Select one of the supported models:
    - `@cf/openai/whisper`
    - `@cf/openai/whisper-tiny-en`
    - `@cf/openai/whisper-large-v3-turbo`
  - **language (optional):** Language of the audio.
  - **prompt (optional):** Initial prompt to guide the transcription.
  - **response_format (optional):** Format of the response. Options include `json` (default), `text`, `srt`, `verbose_json`, and `vtt`.
  - **temperature (optional):** Temperature value between 0 and 1 (default is 0).
  - **timestamp_granularities[] (optional):** Array indicating the granularity of timestamps, either `"word"` or `"segment"` (default is `["segment"]`).

> **Note:** Currently, only the JSON response format is implemented. Other response formats will return a "Not implemented" error.

---

## Project Structure

```
lqm1-openai-workers-ai/
├── README.md
├── biome.json
├── package.json
├── tsconfig.json
├── worker-configuration.d.ts
├── wrangler.jsonc
└── src/
    ├── index.ts
    └── v1/
        └── audio.ts
```

- **`src/index.ts`**  
  Sets up the Hono application, including logging, API documentation, and route mounting.

- **`src/v1/audio.ts`**  
  Defines the transcription endpoint and handles audio processing based on the selected Whisper model.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or bug fixes.

---

## License

This project is licensed under the MIT License.