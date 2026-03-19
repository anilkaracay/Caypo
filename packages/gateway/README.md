# @caypo/canton-gateway

MPP API gateway for Canton Network. Proxies 17 services (46+ endpoints) with Canton payment verification.

## Services

OpenAI, Anthropic, fal.ai, Firecrawl, Google Gemini, Groq, Perplexity, Brave Search, DeepSeek, Resend, Together AI, ElevenLabs, OpenWeather, Google Maps, Judge0, Reloadly, Lob.

## Usage

```typescript
import { app } from "@caypo/canton-gateway";

// Use with any Hono-compatible server
export default app;
```

## Deployment

```bash
cd apps/gateway-server
docker compose up
```

## Discovery

- `GET /health` - Health check
- `GET /api/services` - JSON service catalog
- `GET /llms.txt` - Agent discovery file

## Payment Flow

1. Agent requests `GET /openai/v1/chat/completions`
2. Gateway returns `402` with `WWW-Authenticate: Payment method="canton", amount="0.01", ...`
3. Agent pays via Canton TransferFactory_Transfer
4. Agent retries with `Authorization: Payment <credential>`
5. Gateway verifies on-chain, proxies to upstream, returns with `Payment-Receipt`

## License

Apache-2.0 OR MIT
