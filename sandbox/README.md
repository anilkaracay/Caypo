# Canton Sandbox for CAYPO E2E Testing

## Prerequisites

- **Java 17+** (required for Canton binary)
- **curl** (for health checks)
- **Daml SDK** (optional, for building test DAR)

## Quick Start

### Option A: Canton Binary (recommended for v2 API)

```bash
# Start sandbox (downloads Canton on first run)
./sandbox/setup-binary.sh

# Run E2E tests
pnpm test:e2e

# Stop
./sandbox/stop.sh
```

### Option B: Docker (Canton 2.x, v1 API)

```bash
docker compose -f sandbox/docker-compose.yml up -d

# Wait for health check
curl http://localhost:7575/livez

# Stop
docker compose -f sandbox/docker-compose.yml down
```

### Option C: Remote Canton Node

```bash
CANTON_LEDGER_URL=https://your-canton-node:7575 pnpm test:e2e
```

## Test DAML Model

The `daml/` directory contains a simple Token template that mimics CIP-56 Holding:

- `Token` — with issuer, owner, amount, name
- `Transfer` choice — 1-step transfer to new owner
- `Split` choice — split holding into two UTXOs
- `GetAmount` — non-consuming read

Build with: `cd sandbox/daml && daml build`

## Ports

| Port | Service |
|------|---------|
| 7575 | JSON Ledger API (v2) |
| 5011 | gRPC Ledger API |

## Troubleshooting

**Java not found**: `brew install openjdk@17` (macOS) or `sudo apt install openjdk-17-jdk` (Linux)

**Canton download fails**: Canton 3.4+ may require enterprise access. Use Docker with Canton 2.x or connect to an existing node.

**Port in use**: `lsof -ti:7575 | xargs kill`
