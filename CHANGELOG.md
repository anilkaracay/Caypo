# Changelog

## v0.2.0 (2026-03-19)

Milestone 2 — Full Agent Platform.

### Added
- **SavingsAccount** with yield protocol adapters (MockYieldProtocol: 4% APY)
- **CreditAccount** with collateral management and health factor monitoring (min 1.5)
- **ExchangeAccount** with DEX adapter (USDCx/CC swap with slippage protection)
- **InvestmentAccount** with portfolio P&L, 4 built-in strategies, custom strategies, DCA auto-invest
- Protocol adapter pattern: YieldProtocol, LendingProtocol, DexProtocol interfaces
- **All 35 MCP tools live** (was 14 live + 19 stubs)
- **All 20 MCP prompts fully implemented** (was 5 full + 15 stubs)
- **25+ CLI commands** (was 8): savings, credit, exchange, investment, rewards
- **Agent skills package**: 10 YAML skills for Claude Code, Codex, Copilot, Cursor, Windsurf
- Canton method specification for MPP specs (`specs/canton-method-spec.md`)
- Full API documentation (`docs/api/`)
- Integration guides: quickstart, accept-payments, mcp-setup (`docs/guides/`)
- Production gateway: Dockerfile, docker-compose.prod.yml, Caddyfile, metrics endpoint
- Deployment script (`scripts/deploy-gateway.sh`)
- TransferPreapproval setup guide (`scripts/setup-preapproval.ts`)
- Domain: caypo.xyz / mpp.caypo.xyz

### Changed
- `CantonAgent` now exposes all 5 accounts (savings, credit, exchange, invest)
- `caypo balance` shows all accounts with net total
- Domain migration: cayvox.io → caypo.xyz
- 62 new tests (savings, credit, exchange, investment)

## v0.1.0 (2026-03-19)

Initial release — full monorepo with 5 packages.

### @caypo/mpp-canton
- Canton MPP payment method (cantonMethod, cantonClient, cantonServer)
- Zod schemas for request, credential, receipt
- MppVerificationError with problem codes
- 35 tests

### @caypo/canton-sdk
- CantonClient: JSON Ledger API v2 (submit, query, parties, health)
- USDCxService: Holdings, balance, transfer (TransferFactory_Transfer), merge
- String-based decimal arithmetic (no floating point)
- Holding selection algorithm (single or merge-then-transfer)
- Keystore: AES-256-GCM encrypted wallet with PBKDF2
- SafeguardManager: tx limit, daily limit, lock/unlock, auto-reset
- CheckingAccount: safeguard-checked send, balance, history
- TrafficManager: validator traffic balance
- MppPayClient: HTTP 402 auto-pay flow
- CantonAgent: high-level entry point wiring all services
- AgentConfig: load/save ~/.caypo/config.json
- 215 tests

### @caypo/canton-cli
- `caypo init` — Interactive wallet setup
- `caypo balance` — USDCx balance
- `caypo send <amount> to <recipient>` — Transfer
- `caypo pay <url>` — MPP 402 auto-pay
- `caypo address` — Party ID
- `caypo safeguards` — View/set limits, lock/unlock
- `caypo traffic` — Validator traffic
- `caypo mcp install` — MCP server for Claude/Cursor/Windsurf

### @caypo/canton-mcp
- 33 MCP tools (14 live, 19 Phase 3/4 stubs)
- 20 prompts (5 fully implemented, 15 stubs)
- stdio transport for Claude Desktop

### @caypo/canton-gateway
- 17 services, 46 endpoints with MPP payment gate
- Generic upstream proxy with API key injection
- Discovery: /api/services, /llms.txt, /health
- Hono framework, Docker deployment ready
