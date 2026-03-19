# @caypo/mpp-canton

**Canton Network payment method for the [Machine Payments Protocol (MPP)](https://mpp.dev)**

Accept and make USDCx payments in any HTTP API using Canton's CIP-56 token standard with 1-step TransferPreapproval transfers.

[![License](https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue)](../../LICENSE-APACHE)

## Install

```bash
npm install @caypo/mpp-canton
```

## Accept Payments (Server)

```typescript
import { cantonServer } from "@caypo/mpp-canton/server";

const server = cantonServer({
  ledgerUrl: "http://localhost:7575",
  token: process.env.CANTON_JWT,
  userId: "ledger-api-user",
  recipientPartyId: "Gateway::1220...",
  network: "mainnet",
});

// When agent submits credential after paying:
const receipt = await server.verify({ credential });
// { method: "canton", reference: "upd-abc123", status: "success" }
```

## Make Payments (Client)

```typescript
import { cantonClient } from "@caypo/mpp-canton/client";

const client = cantonClient({
  ledgerUrl: "http://localhost:7575",
  token: process.env.CANTON_JWT,
  userId: "ledger-api-user",
  partyId: "Agent::1220...",
  network: "mainnet",
});

// When receiving a 402 challenge:
const credential = await client.createCredential({ challenge });
// Base64-encoded credential with updateId, completionOffset, sender, commandId
```

## Method Definition

```typescript
import { cantonMethod } from "@caypo/mpp-canton";

cantonMethod.name;   // "canton"
cantonMethod.intent; // "charge"
```

## Schemas

```typescript
import { requestSchema, credentialPayloadSchema } from "@caypo/mpp-canton";

// Validate payment requests
requestSchema.parse({ amount: "0.01", currency: "USDCx", recipient: "...", network: "mainnet" });

// Validate credentials
credentialPayloadSchema.parse({ updateId: "...", completionOffset: 42, sender: "...", commandId: "..." });
```

## Error Handling

```typescript
import { MppVerificationError } from "@caypo/mpp-canton";

try {
  await server.verify({ credential });
} catch (err) {
  if (err instanceof MppVerificationError) {
    console.log(err.problemCode); // "verification-failed" | "payment-insufficient"
  }
}
```

## How It Works

The Canton MPP method uses **CIP-56 TransferPreapproval** for 1-step transfers:

1. Service returns `402` with `WWW-Authenticate: Payment method="canton", amount="0.01", recipient="...", network="..."`
2. Agent exercises `TransferFactory_Transfer` on Canton (requires recipient's TransferPreapproval)
3. Agent builds credential with `{ updateId, completionOffset, sender, commandId }`
4. Service verifies by fetching the transaction from Canton ledger
5. Service confirms: Holding created for recipient, amount >= required, correct sender

## Links

- [MPP Protocol](https://mpp.dev) — Machine Payments Protocol by Stripe and Tempo
- [Canton Network](https://canton.network) — Privacy-enabled institutional blockchain
- [CIP-56](https://canton.network) — Canton token standard

## License

Apache-2.0 OR MIT
