# Architecture — Canton Agent (Production)

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Agents / Users                         │
│  (Claude Desktop, Cursor, Windsurf, Claude Code, CLI)       │
└───────┬──────────────┬──────────────┬───────────────────────┘
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │   MCP   │   │   CLI   │   │   SDK   │
   │ Server  │   │  Tool   │   │  (API)  │
   └────┬────┘   └────┬────┘   └────┬────┘
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │  @cayvox/canton  │
              │      -sdk       │
              │                 │
              │ CheckingAccount │ ← USDCx Holding queries + TransferFactory
              │ SafeguardMgr    │ ← Pre-tx checks
              │ TrafficMgr      │ ← Validator traffic (NOT gas)
              │ MppPayClient    │ ← HTTP 402 auto-handling
              │ CantonClient    │ ← JSON Ledger API v2
              └────────┬────────┘
                       │ HTTPS + JWT
              ┌────────▼────────┐
              │  Canton Validator│
              │  Node (port 7575)│
              │                 │
              │ /v2/commands/*  │
              │ /v2/state/*     │
              │ /v2/parties     │
              │ /v2/updates/*   │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │ Global Synchro- │
              │    nizer        │
              │                 │
              │ USDCx (CIP-56)  │
              │ CC (native)     │
              │ TransferPreappr.│
              └─────────────────┘
```

## MPP Payment Flow (Verified)

```
1. Agent → POST mpp.cayvox.io/openai/v1/chat/completions
2. Gateway → 402 + WWW-Authenticate: Payment method="canton" ...
3. Agent SDK:
   a. Parse challenge (amount, recipient party, network)
   b. Query agent's USDCx holdings via /v2/state/active-contracts
   c. Select holdings covering amount
   d. Exercise TransferFactory_Transfer via /v2/commands/submit-and-wait
      (works because gateway has TransferPreapproval active)
   e. Receive { updateId, completionOffset }
   f. Build credential with updateId + completionOffset + sender + commandId
4. Agent → POST mpp.cayvox.io/openai/v1/chat/completions + Authorization: Payment <credential>
5. Gateway:
   a. Extract updateId from credential
   b. Fetch transaction via /v2/updates/transaction-by-id/{updateId}
   c. Verify: Holding created for gateway party, amount >= required
   d. Issue Receipt
6. Gateway → proxy to OpenAI → 200 + Payment-Receipt + OpenAI response
```

## Package Dependencies

```
@cayvox/canton-mcp ──────┐
@cayvox/canton-cli ──────┤──▶ @cayvox/canton-sdk ──▶ Canton Ledger API v2
@cayvox/canton-gateway ──┤
                         └──▶ @cayvox/mpp-canton ──▶ mppx (peer)
```

## Security

```
~/.canton-agent/
├── wallet.key       AES-256-GCM encrypted (PIN → PBKDF2 → key)
├── config.json      Ledger URL, party ID, settings
└── safeguards.json  Tx limit, daily limit, lock state, daily counter
```

- JWT never stored in plaintext config — derived from encrypted keystore
- Safeguards enforced SDK-level before every Canton command
- Traffic check before every command (avoid UNAVAILABLE errors)
- TransferPreapproval on gateway renewed before expiry
