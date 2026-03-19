# @cayvox/canton-gateway — MPP API Gateway (Production)

## URL: mpp.caypo.xyz

## CRITICAL: Gateway TransferPreapproval

Before accepting ANY payment, the gateway MUST have an active `TransferPreapproval` contract for its party. Without this, agents cannot do 1-step transfers and the MPP flow breaks.

Setup: Exercise the preapproval creation via the validator API or Ledger API. Renew annually ($1/year fee controlled by super validators).

## Services (17 services, 46+ endpoints)

| Service | Path | Endpoints | Price Range |
|---------|------|-----------|-------------|
| OpenAI | /openai | 5 (chat, embeddings, images, transcriptions, speech) | $0.001-$0.05 |
| Anthropic | /anthropic | 1 (messages) | $0.01 |
| fal.ai | /fal | 5 (image gen, audio, video) | $0.01-$0.10 |
| Firecrawl | /firecrawl | 4 (scrape, crawl, map, extract) | $0.005-$0.02 |
| Google Gemini | /gemini | 3 (chat, reasoning, embeddings) | $0.005-$0.02 |
| Groq | /groq | 2 (chat, embeddings) | $0.001-$0.005 |
| Perplexity | /perplexity | 1 (chat with search) | $0.01 |
| Brave Search | /brave | 5 (web, images, news, videos, suggest) | $0.001-$0.005 |
| DeepSeek | /deepseek | 1 (chat) | $0.005 |
| Resend | /resend | 2 (send, batch) | $0.005 |
| Together AI | /together | 3 (chat, embeddings, images) | $0.001-$0.02 |
| ElevenLabs | /elevenlabs | 2 (TTS, voice clone) | $0.02-$0.05 |
| OpenWeather | /openweather | 2 (current, forecast) | $0.001 |
| Google Maps | /googlemaps | 3 (geocode, places, directions) | $0.005 |
| Judge0 | /judge0 | 2 (execute, languages) | $0.002 |
| Reloadly | /reloadly | 2 (list, purchase gift cards) | $0.01+ |
| Lob | /lob | 3 (postcard, letter, verify address) | $0.01-$0.50 |

## Discovery
- `GET /api/services` — JSON service catalog
- `GET /llms.txt` — Agent discovery file
- `GET /health` — Health check

## Implementation: Hono framework with mppx middleware
## Deployment: Docker on Cherry VPS, Caddy reverse proxy, mpp.caypo.xyz
