# CAYPO

### A bank account for AI agents on Canton Network

Privacy-preserving agent payments on Canton Network using CIP-56 token standard, USDCx stablecoin via Circle xReserve, and the MPP (Micropayment Protocol) for HTTP 402 auto-pay flows.

---

## Features

- **Checking Account** — USDCx balance, send/receive, transaction history
- **MPP Auto-Pay** — HTTP 402 payment flow for 17+ API services
- **MCP Server** — 33 tools + 20 prompts for Claude Desktop, Cursor, Windsurf
- **CLI Tool** — `caypo` command for wallet management
- **API Gateway** — Proxy 46+ endpoints with Canton payment verification
- **Safeguards** — Per-transaction and daily spending limits, wallet lock
- **Encrypted Keystore** — AES-256-GCM with PBKDF2 key derivation
- **String Arithmetic** — No floating point — all amounts are strings

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@caypo/mpp-canton`](packages/mpp/) | MPP payment method — CIP-56 TransferPreapproval | v0.1.0 |
| [`@caypo/canton-sdk`](packages/sdk/) | Core SDK — Canton API client, USDCx, safeguards, keystore | v0.1.0 |
| [`@caypo/canton-cli`](packages/cli/) | CLI — `caypo` command (init, balance, send, pay, safeguards) | v0.1.0 |
| [`@caypo/canton-mcp`](packages/mcp/) | MCP server — 33 tools + 20 prompts | v0.1.0 |
| [`@caypo/canton-gateway`](packages/gateway/) | API gateway — 17 services, 46 endpoints | v0.1.0 |

## Quick Start

```bash
# Clone and install
git clone https://github.com/anilkaracay/Caypo.git
cd Caypo
pnpm install

# Build all packages
pnpm build

# Run tests (250 tests)
pnpm test

# Set up your agent wallet
pnpm --filter @caypo/canton-cli build
node packages/cli/dist/index.js init

# Check balance
node packages/cli/dist/index.js balance
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Agents / Users                     │
│  (Claude Desktop, Cursor, Windsurf, Claude Code, CLI)   │
└───────┬──────────────┬──────────────┬───────────────────┘
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │   MCP   │   │   CLI   │   │ Gateway │
   │ Server  │   │  Tool   │   │  Proxy  │
   │ 33 tools│   │ 8 cmds  │   │ 17 svcs │
   └────┬────┘   └────┬────┘   └────┬────┘
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │  @caypo/canton  │
              │      -sdk       │
              │                 │
              │ CantonClient    │ ← JSON Ledger API v2
              │ USDCxService    │ ← CIP-56 Holdings + Transfer
              │ SafeguardMgr    │ ← Pre-tx checks
              │ TrafficMgr      │ ← Validator traffic
              │ MppPayClient    │ ← HTTP 402 auto-handling
              │ Keystore        │ ← AES-256-GCM encrypted
              └────────┬────────┘
                       │ HTTPS + JWT
              ┌────────▼────────┐
              │  Canton Network │
              │  (port 7575)    │
              │                 │
              │ USDCx (CIP-56)  │
              │ CC (native)     │
              │ Privacy by      │
              │ default         │
              └─────────────────┘
```

## Gateway Services

| Service | Endpoints | Price Range |
|---------|-----------|-------------|
| OpenAI | 5 | $0.001-$0.05 |
| Anthropic | 1 | $0.01 |
| fal.ai | 5 | $0.01-$0.10 |
| Firecrawl | 4 | $0.005-$0.02 |
| Google Gemini | 3 | $0.005-$0.02 |
| Groq | 2 | $0.001-$0.005 |
| Perplexity | 1 | $0.01 |
| Brave Search | 5 | $0.001-$0.005 |
| DeepSeek | 1 | $0.005 |
| Resend | 2 | $0.005 |
| Together AI | 3 | $0.001-$0.02 |
| ElevenLabs | 2 | $0.02-$0.05 |
| OpenWeather | 2 | $0.001 |
| Google Maps | 3 | $0.005 |
| Judge0 | 2 | $0.002 |
| Reloadly | 2 | $0.01+ |
| Lob | 3 | $0.01-$0.50 |

## Development

```bash
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm typecheck    # TypeScript check
pnpm lint         # ESLint
pnpm clean        # Remove build artifacts
```

## Canton Network

Canton is **not** an EVM chain. Key differences:

- **Party IDs** instead of addresses: `Agent::1220abcdef...`
- **JSON Ledger API v2** at port 7575 (not JSON-RPC)
- **CIP-56** token standard (not ERC-20)
- **Traffic budgets** per validator (not per-tx gas fees)
- **Privacy by default** — only transaction parties see data
- **USDCx** — USDC-backed via Circle xReserve
- **All amounts are strings** — never floating point

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run `pnpm test` to verify
5. Submit a pull request

## License

Dual-licensed under [Apache 2.0](LICENSE-APACHE) and [MIT](LICENSE-MIT).

Copyright 2025 Cayvox Labs
