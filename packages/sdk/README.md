# @caypo/canton-sdk

Core SDK for Canton Network — JSON Ledger API v2 client, USDCx operations, agent accounts, safeguards, and MPP auto-pay.

## Install

```bash
pnpm add @caypo/canton-sdk
```

## Quick Start

```typescript
import { CantonAgent } from "@caypo/canton-sdk";

const agent = await CantonAgent.create({
  ledgerUrl: "http://localhost:7575",
  token: "jwt-token",
  partyId: "Agent::1220...",
  network: "testnet",
});

// Check balance
const bal = await agent.checking.balance();
console.log(`${bal.available} USDCx (${bal.holdingCount} holdings)`);

// Send USDCx
await agent.checking.send("Bob::1220...", "10.00");

// Pay for API (402 auto-handling)
const result = await agent.mpp.pay("https://mpp.cayvox.io/openai/v1/chat/completions", {
  method: "POST",
  body: JSON.stringify({ model: "gpt-4", messages: [{ role: "user", content: "Hello" }] }),
  maxPrice: "0.05",
});
```

## API

### CantonAgent
- `CantonAgent.create(config)` - Create from config file
- `agent.checking` - CheckingAccount (balance, send, history)
- `agent.safeguards` - SafeguardManager (tx/daily limits, lock)
- `agent.traffic` - TrafficManager (validator traffic)
- `agent.mpp` - MppPayClient (402 auto-pay)

### Low-level
- `CantonClient` - JSON Ledger API v2 client
- `USDCxService` - Holding queries, transfers, merging
- `Keystore` - AES-256-GCM encrypted wallet
- Amount utilities: `addAmounts`, `compareAmounts`, `subtractAmounts`

## License

Apache-2.0 OR MIT
