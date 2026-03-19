<p align="center">
  <h1 align="center">CAYPO</h1>
  <p align="center"><strong>A bank account for AI agents on Canton Network</strong></p>
  <p align="center">
    <a href="LICENSE-APACHE"><img src="https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue" alt="License"></a>
    <img src="https://img.shields.io/badge/tests-264%20passing-brightgreen" alt="Tests">
    <img src="https://img.shields.io/badge/canton-DevNet%20verified-purple" alt="Canton DevNet">
    <img src="https://img.shields.io/badge/packages-5-orange" alt="Packages">
  </p>
  <p align="center">
    Built on <a href="https://canton.network">Canton Network</a> &bull; Powered by <a href="https://mpp.dev">MPP</a> (Stripe &times; Tempo)
  </p>
</p>

---

## What is CAYPO?

AI agents need to pay for things — API calls, compute, data, services. But today, agents can't hold money, can't authorize payments, and can't settle transactions on their own. Every API call requires a human-provisioned key with a credit card behind it.

**CAYPO gives AI agents their own bank account on Canton Network.** Agents hold USDCx (Circle's USDC-backed stablecoin on Canton), make instant payments using the [Machine Payments Protocol (MPP)](https://mpp.dev) by Stripe and Tempo, and settle directly on-chain — no credit cards, no API keys, no humans in the loop.

Canton Network is the institutional blockchain built by Digital Asset, backed by DTCC, Goldman Sachs, JPMorgan, and BNP Paribas. Unlike public chains, Canton provides **sub-transaction privacy** — payment details are only visible to sender and receiver. CAYPO is the bridge between Canton and the agentic economy.

## How It Works

```
Agent                              Gateway                         Canton Network
  |                                   |                                  |
  |-- POST /openai/v1/chat -------->  |                                  |
  |<-- 402 Payment Required ---------  |                                  |
  |    WWW-Authenticate: Payment       |                                  |
  |    method="canton"                 |                                  |
  |    amount="0.01"                   |                                  |
  |    recipient="Gateway::1220..."    |                                  |
  |                                    |                                  |
  |  [USDCx transfer via CIP-56 TransferFactory — ~1-3 seconds]          |
  |-- submit-and-wait ---------------------------------------------->    |
  |<-- { updateId, completionOffset } ------------------------------>    |
  |                                    |                                  |
  |-- POST /openai/v1/chat -------->   |                                  |
  |   + Authorization: Payment <cred>  |                                  |
  |                                    |-- verify transaction --------->  |
  |                                    |<-- confirmed -----------------   |
  |<-- 200 OK + Payment-Receipt -----  |                                  |
  |    + OpenAI response               |                                  |
```

## Packages

| Package | Description |
|---------|-------------|
| **[@caypo/mpp-canton](packages/mpp/)** | Canton payment method for MPP — accept and make USDCx payments in any HTTP API |
| **[@caypo/canton-sdk](packages/sdk/)** | Core SDK — Canton API client, USDCx transfers, encrypted wallets, safeguards, MPP auto-pay |
| **[@caypo/canton-cli](packages/cli/)** | CLI tool — `caypo init`, `caypo send`, `caypo pay`, 8 commands |
| **[@caypo/canton-mcp](packages/mcp/)** | MCP server — 33 tools + 20 prompts for Claude Desktop, Cursor, Windsurf |
| **[@caypo/canton-gateway](packages/gateway/)** | API gateway — 17 services, 46 endpoints with pay-per-request pricing |

## Quick Start

```bash
# Install the CLI
npm install -g @caypo/canton-cli

# Set up your agent wallet
caypo init

# Check balance
caypo balance

# Send USDCx
caypo send 10.00 to Bob::1220abcdef...

# Pay for an API call (auto-handles 402 flow)
caypo pay https://mpp.caypo.xyz/openai/v1/chat/completions --max-price 0.05

# Install MCP server for Claude Desktop
caypo mcp install
```

## For API Developers — Accept Payments

Add Canton USDCx payments to any HTTP API in 5 lines:

```typescript
import { cantonServer } from "@caypo/mpp-canton/server";

const server = cantonServer({
  ledgerUrl: "http://localhost:7575",
  token: process.env.CANTON_JWT,
  userId: "ledger-api-user",
  recipientPartyId: "Gateway::1220...",
  network: "mainnet",
});

// On 402 challenge response, verify the payment credential:
const receipt = await server.verify({ credential });
// receipt: { method: "canton", reference: updateId, status: "success" }
```

## For AI Agents — Make Payments

```typescript
import { CantonAgent } from "@caypo/canton-sdk";

const agent = await CantonAgent.create();

// Check balance
const { available } = await agent.checking.balance();

// Pay for an API call (automatic 402 handling)
const result = await agent.mpp.pay("https://mpp.caypo.xyz/openai/v1/chat/completions", {
  method: "POST",
  body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: "Hello" }] }),
  maxPrice: "0.05",
});

console.log(result.response.status); // 200
console.log(result.receipt);         // { updateId, amount: "0.01", ... }
```

## MCP Integration

Connect Canton banking to your AI assistant:

```bash
caypo mcp install
```

Then ask Claude: *"What's my CAYPO balance?"* or *"Send 5 USDCx to Alice::1220..."*

**33 tools** — balance, send, receive, pay, safeguards, traffic, and more.
**20 prompts** — morning briefing, financial report, security audit, spending analysis.

## Gateway Services

Pay-per-request access to 17 API services. No API keys needed — just USDCx.

| Service | Endpoints | Price |
|---------|-----------|-------|
| **OpenAI** | chat, embeddings, images, audio | $0.001 – $0.05 |
| **Anthropic** | messages | $0.01 |
| **fal.ai** | image gen, audio, video | $0.01 – $0.10 |
| **Firecrawl** | scrape, crawl, map, extract | $0.005 – $0.02 |
| **Google Gemini** | chat, reasoning, embeddings | $0.005 – $0.02 |
| **Groq** | chat, embeddings | $0.001 – $0.005 |
| **Perplexity** | chat with search | $0.01 |
| **Brave Search** | web, images, news, videos | $0.001 – $0.005 |
| **DeepSeek** | chat | $0.005 |
| **Resend** | send email, batch | $0.005 |
| **Together AI** | chat, embeddings, images | $0.001 – $0.02 |
| **ElevenLabs** | TTS, voice clone | $0.02 – $0.05 |
| **OpenWeather** | current, forecast | $0.001 |
| **Google Maps** | geocode, places, directions | $0.005 |
| **Judge0** | execute code, languages | $0.002 |
| **Reloadly** | gift cards | $0.01+ |
| **Lob** | postcards, letters, address verify | $0.01 – $0.50 |

## Why Canton?

1. **Privacy-Preserving Payments** — Sub-transaction privacy. Only sender and receiver see payment details.
2. **Institutional Compliance** — Partners: DTCC, Goldman Sachs, JPMorgan, BNP Paribas. Basel III compliant.
3. **USDCx via Circle** — Institutional-grade stablecoin. 1:1 USDC-backed via xReserve. Cross-chain via CCTP.
4. **Atomic Settlement** — Pay and settle in one transaction. No pending states, no chargebacks.
5. **Canton Coin Rewards** — Applications earn CC mining rewards based on usage (Cantonomics).

## Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  MCP Server │  │     CLI     │  │   Gateway   │
│  35 tools   │  │  25+ cmds   │  │ 17 services │
│  20 prompts │  │  chalk+ora  │  │  46 endpts  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       └────────────────┼────────────────┘
               ┌────────▼────────┐
               │  @caypo/canton  │
               │      -sdk       │
               │                 │
               │ CantonAgent     │
               │ CheckingAccount │
               │ SafeguardMgr    │
               │ TrafficMgr      │
               │ MppPayClient    │
               │ Keystore (AES)  │
               └────────┬────────┘
                        │
               ┌────────▼────────┐
               │  @caypo/mpp     │
               │    -canton      │
               │                 │
               │ cantonMethod    │
               │ cantonClient    │
               │ cantonServer    │
               └────────┬────────┘
                        │ HTTPS + JWT
               ┌────────▼────────┐
               │  Canton Network │
               │   (port 7575)   │
               │                 │
               │  USDCx (CIP-56) │
               │  CC (native)    │
               │  Privacy        │
               └─────────────────┘
```

## Verified on Canton DevNet

```
312 tests — 100% passing
 14 E2E tests against live Canton DevNet (Splice v0.5.12)
  7 packages — all building
 35 MCP tools — all live
 20 MCP prompts — all implemented
 46 gateway endpoints — /health returns 200
```

Test breakdown: 277 SDK (client, USDCx, amounts, safeguards, keystore, agent, pay-client, savings, credit, exchange, investment) + 35 MPP (schemas, client, server, round-trip) + 14 E2E (live Canton DevNet).

## Roadmap

| Version | Features | Status |
|---------|----------|--------|
| **v0.1** | MPP payment method, Core SDK, CLI, MCP server, Gateway | Done |
| **v1.0** | Production-ready, npm publish, documentation site | In progress |
| **v1.1** | Savings account (DeFi yield on Canton) | Phase 3 |
| **v2.0** | Session intent (streaming payments, pay-per-token) | Phase 3 |
| **v2.1** | Exchange (Temple DEX integration) | Phase 3 |
| **v3.0** | Investment accounts, Credit, Portfolio management | Phase 4 |

## Development

```bash
pnpm install        # Install dependencies
pnpm build          # Build all 7 packages
pnpm test           # Run 264 tests
pnpm test:e2e       # E2E tests (needs Canton sandbox)
pnpm verify         # Full 20-check verification suite
```

## Built by Cayvox Labs

Canton DevNet validator operator since 2025.

**Contributors:** Anil Karacay (CEO), Sude Ceren Sahin (Lead Engineer), Yusuf Simsek (Growth)

## License

Dual-licensed under [Apache 2.0](LICENSE-APACHE) and [MIT](LICENSE-MIT).

Copyright 2025 Cayvox Labs

---

<p align="center">
  <a href="https://canton.network">Canton Network</a> &bull;
  <a href="https://mpp.dev">MPP Protocol</a> &bull;
  <a href="https://github.com/tempoxyz/mpp-specs">MPP Specs</a>
</p>
