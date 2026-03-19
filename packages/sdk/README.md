# @caypo/canton-sdk

**Core SDK for AI agent banking on [Canton Network](https://canton.network)**

USDCx transfers, encrypted wallets, safeguards, traffic management, and MPP auto-pay — everything an AI agent needs to operate a bank account on Canton.

[![License](https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue)](../../LICENSE-APACHE)
[![Tests](https://img.shields.io/badge/tests-215%20passing-brightgreen)](../../)

## Install

```bash
npm install @caypo/canton-sdk
```

## Quick Start

```typescript
import { CantonAgent } from "@caypo/canton-sdk";

const agent = await CantonAgent.create({
  ledgerUrl: "http://localhost:7575",
  token: "your-jwt",
  partyId: "Agent::1220...",
  network: "testnet",
});

// Balance
const { available, holdingCount } = await agent.checking.balance();
console.log(`${available} USDCx across ${holdingCount} holdings`);

// Send USDCx (safeguards checked automatically)
const tx = await agent.checking.send("Bob::1220...", "10.00");
console.log(`Sent! Update ID: ${tx.updateId}`);

// Pay for API call (handles 402 automatically)
const result = await agent.mpp.pay("https://mpp.cayvox.io/openai/v1/chat/completions", {
  method: "POST",
  body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: "Hello" }] }),
  maxPrice: "0.05",
});
```

## Features

### CantonClient — JSON Ledger API v2

```typescript
import { CantonClient } from "@caypo/canton-sdk";

const client = new CantonClient({ ledgerUrl, token, userId });
await client.submitAndWait({ commands, commandId, actAs });
await client.queryActiveContracts({ filtersByParty, activeAtOffset });
await client.getLedgerEnd();
await client.allocateParty("Alice");
await client.isHealthy();
```

### USDCxService — Token Operations

```typescript
import { USDCxService } from "@caypo/canton-sdk";

const usdcx = new USDCxService(client, partyId);
const holdings = await usdcx.getHoldings();     // USDCx UTXO holdings
const balance = await usdcx.getBalance();        // Sum as string
await usdcx.transfer({ recipient, amount });     // TransferFactory_Transfer
await usdcx.mergeHoldings(holdingCids);          // Consolidate UTXOs
```

### SafeguardManager — Spending Controls

```typescript
import { SafeguardManager } from "@caypo/canton-sdk";

const safeguards = await SafeguardManager.load();
safeguards.setTxLimit("100");                    // Per-transaction limit
safeguards.setDailyLimit("1000");                // Daily spending limit
safeguards.lock("1234");                         // Lock wallet
const { allowed, reason } = safeguards.check("50"); // Pre-tx check
```

### Keystore — Encrypted Wallet

```typescript
import { Keystore } from "@caypo/canton-sdk";

const ks = await Keystore.create("1234", { partyId, jwt, userId });
const loaded = await Keystore.load("1234");
const { partyId, jwt } = loaded.getCredentials();
await loaded.changePin("1234", "5678");
```

### Amount Utilities — No Floating Point

```typescript
import { addAmounts, compareAmounts, subtractAmounts } from "@caypo/canton-sdk";

addAmounts("1.5", "2.5");           // "4"
compareAmounts("10", "9.99");        // 1
subtractAmounts("100", "0.01");      // "99.99"
// All amounts are strings — Canton uses Numeric 10 (10 decimal places)
```

## API Reference

| Class | Purpose |
|-------|---------|
| `CantonAgent` | High-level entry point — wires all services together |
| `CheckingAccount` | Balance, send, receive, history |
| `CantonClient` | Low-level JSON Ledger API v2 client |
| `USDCxService` | Holdings, balance, transfer, merge |
| `SafeguardManager` | Tx/daily limits, lock/unlock |
| `TrafficManager` | Validator traffic balance |
| `MppPayClient` | HTTP 402 auto-pay flow |
| `Keystore` | AES-256-GCM encrypted wallet |

## License

Apache-2.0 OR MIT
