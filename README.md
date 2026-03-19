# CAYPO — A bank account for AI agents on Canton Network

Privacy-preserving agent payments on Canton Network using CIP-56 token standard, USDCx stablecoin via Circle xReserve, and the MPP (Micropayment Protocol) for HTTP 402 auto-pay flows.

## Packages

| Package | Description |
|---------|-------------|
| [`@caypo/mpp-canton`](packages/mpp/) | MPP payment method — CIP-56 TransferPreapproval for 1-step transfers |
| [`@caypo/canton-sdk`](packages/sdk/) | Core SDK — JSON Ledger API v2 client, USDCx operations, agent accounts |
| [`@caypo/canton-cli`](packages/cli/) | CLI tool — `canton-agent` / `ca` commands |
| [`@caypo/canton-mcp`](packages/mcp/) | MCP server — 33 tools + 20 prompts for AI agent integration |
| [`@caypo/canton-gateway`](packages/gateway/) | MPP API gateway — 17 services, 46+ endpoints |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Development

```bash
# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Clean all build artifacts
pnpm clean
```

## Architecture

```
AI Agents ─── MCP Server ───┐
              CLI Tool ──────┤──▶ canton-sdk ──▶ Canton Ledger API v2
              Gateway ───────┤
                             └──▶ mpp-canton ──▶ mppx (peer)
```

Canton Network: JSON Ledger API v2 (port 7575), CIP-56 token standard, USDCx + CC, privacy by default.

## License

Dual-licensed under [Apache 2.0](LICENSE-APACHE) and [MIT](LICENSE-MIT).

Copyright 2025 Cayvox Labs
