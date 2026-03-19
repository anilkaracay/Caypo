# Canton Agent — Claude Code Skill (Production)

## Context

Building "Canton Agent" — a bank account for AI agents on Canton Network.
Canton equivalent of t2000 (Sui). Monorepo: pnpm + Turborepo.

## CRITICAL: Canton is NOT an EVM chain

1. Smart contracts = DAML templates (not Solidity/Move)
2. Addresses = Party IDs: `Name::122084768362d0ce21f1ffec870e55e365a292cdf8f54c5c38ad7775b9bdd462e141`
3. Privacy by default — only transaction parties see data
4. JSON Ledger API v2 at port 7575 (NOT JSON-RPC)
5. CIP-56 token standard (NOT ERC-20)
6. Traffic system (NOT gas fees) — validators have traffic budgets
7. USDCx = USDC-backed stablecoin via Circle xReserve
8. CC = Canton Coin (native utility token for traffic/fees)

## JSON Ledger API v2 — Key Endpoints

```
POST /v2/commands/submit-and-wait          — Submit command, get { updateId, completionOffset }
POST /v2/commands/submit-and-wait-for-transaction — Submit, get full transaction
POST /v2/state/active-contracts            — Query active contracts at offset
GET  /v2/state/ledger-end                  — Current ledger offset
POST /v2/parties                           — Allocate party
GET  /v2/updates/transaction-by-id/:id     — Get transaction for verification
GET  /livez                                — Health check
```

All requests need: `Authorization: Bearer <jwt-token>`

## Command Format (submit-and-wait)

```json
{
  "commands": [
    { "ExerciseCommand": {
        "templateId": "pkghash:Module:Template",
        "contractId": "00572c50...",
        "choice": "TransferFactory_Transfer",
        "choiceArgument": { "sender": "...", "receiver": "...", "amount": "1.0", ... }
    }}
  ],
  "userId": "ledger-api-user",
  "commandId": "uuid-here",
  "actAs": ["Party::1220..."],
  "readAs": ["Party::1220..."]
}
```

## USDCx Transfer — TWO PATTERNS

### Pattern A: 1-step (TransferPreapproval exists) — USE THIS FOR MPP
Receiver has TransferPreapproval → sender exercises TransferFactory_Transfer → done in 1 tx.

### Pattern B: 2-step (no preapproval)
Sender creates TransferInstruction → receiver exercises TransferInstruction_Accept → 2 txs.

**MPP gateway MUST have TransferPreapproval active.**

## Build Order

```
1. packages/mpp    → depends on mppx (peer)
2. packages/sdk    → depends on packages/mpp
3. packages/cli    → depends on packages/sdk
4. packages/mcp    → depends on packages/sdk
5. packages/gateway → depends on packages/mpp
```

## Tech Stack

- TypeScript 5.4+, strict, ESM-first
- pnpm workspaces + Turborepo
- tsup (ESM + CJS)
- vitest + msw
- zod (mppx standard)
- mppx (peer dep)
- @modelcontextprotocol/sdk (MCP)
- commander + chalk + ora (CLI)
- Hono (gateway)

## Coding Rules

1. ALL amounts = strings (never float). USDCx has up to 10 decimal places internally.
2. Every Canton API call needs error handling (network, JWT expiry, PERMISSION_DENIED).
3. Every write operation needs a unique `commandId` (use `crypto.randomUUID()`).
4. Safeguards check BEFORE every transaction.
5. Traffic check BEFORE every transaction.
6. Named exports only (no default exports).
7. Tests in `__tests__/` next to source.
8. Zod for all external data validation.

## Reference Files

- `PROJECT.md` — Master spec with verified Canton facts
- `CANTON-API.md` — JSON Ledger API v2 reference
- `packages/mpp/SPEC.md` — MPP payment method (TransferPreapproval flow)
- `packages/sdk/SPEC.md` — Core SDK API
- `packages/cli/SPEC.md` — CLI commands
- `packages/mcp/SPEC.md` — MCP 33 tools + 20 prompts
- `packages/gateway/SPEC.md` — Gateway 17 services
