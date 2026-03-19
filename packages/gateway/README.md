# @caypo/canton-gateway

**MPP API gateway — pay-per-request access to OpenAI, Anthropic, and 15+ services with Canton USDCx**

No API keys needed. Agents pay per request with USDCx on Canton Network via the [Machine Payments Protocol (MPP)](https://mpp.dev).

[![License](https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue)](../../LICENSE-APACHE)
[![Services](https://img.shields.io/badge/services-17-orange)](../../)
[![Endpoints](https://img.shields.io/badge/endpoints-46-orange)](../../)

## Services

| Service | Endpoints | Price | Category |
|---------|-----------|-------|----------|
| **OpenAI** | chat, embeddings, images, transcription, speech | $0.001 – $0.05 | AI / LLM |
| **Anthropic** | messages | $0.01 | AI / LLM |
| **fal.ai** | image gen, stable diffusion, whisper, video, TTS | $0.01 – $0.10 | AI / Media |
| **Firecrawl** | scrape, crawl, map, extract | $0.005 – $0.02 | Data |
| **Google Gemini** | chat, reasoning, embeddings | $0.005 – $0.02 | AI / LLM |
| **Groq** | chat, embeddings | $0.001 – $0.005 | AI / LLM |
| **Perplexity** | chat with search | $0.01 | AI / Search |
| **Brave Search** | web, images, news, videos, suggest | $0.001 – $0.005 | Search |
| **DeepSeek** | chat | $0.005 | AI / LLM |
| **Resend** | send, batch email | $0.005 | Communication |
| **Together AI** | chat, embeddings, images | $0.001 – $0.02 | AI / LLM |
| **ElevenLabs** | TTS, voice clone | $0.02 – $0.05 | Audio |
| **OpenWeather** | current, forecast | $0.001 | Data |
| **Google Maps** | geocode, places, directions | $0.005 | Data |
| **Judge0** | execute code, languages | $0.002 | Developer |
| **Reloadly** | gift cards | $0.01+ | Commerce |
| **Lob** | postcards, letters, address verify | $0.01 – $0.50 | Mail |

## How It Works

```
1. Agent sends request     →  POST /openai/v1/chat/completions
2. Gateway returns 402     ←  WWW-Authenticate: Payment method="canton" ...
3. Agent pays on Canton    →  TransferFactory_Transfer (USDCx)
4. Agent retries + cred    →  Authorization: Payment <credential>
5. Gateway verifies        →  Fetches transaction from Canton ledger
6. Gateway proxies         →  Forwards to OpenAI with API key
7. Agent receives          ←  200 OK + Payment-Receipt + response
```

## Discovery

```bash
curl https://mpp.caypo.xyz/api/services   # JSON catalog
curl https://mpp.caypo.xyz/llms.txt       # Agent discovery
curl https://mpp.caypo.xyz/health          # Health check
```

## Use as Library

```typescript
import { app } from "@caypo/canton-gateway";

// app is a Hono instance — use with any compatible server
export default app;
```

## Self-Host

```bash
cd apps/gateway-server
docker compose up -d
```

Required env vars: `GATEWAY_PARTY_ID`, `CANTON_LEDGER_URL`, `CANTON_JWT`, and API keys for each upstream service.

## License

Apache-2.0 OR MIT
