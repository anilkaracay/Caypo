# Changelog

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
