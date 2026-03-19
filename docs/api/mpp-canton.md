# @caypo/mpp-canton — API Reference

Canton Network payment method for the Machine Payments Protocol.

## cantonMethod

The method definition object.

```typescript
import { cantonMethod } from "@caypo/mpp-canton";

cantonMethod.name;   // "canton"
cantonMethod.intent; // "charge"
cantonMethod.schema; // { credential: { payload: ZodSchema }, request: ZodSchema }
```

## cantonClient(config)

Create a client for making Canton USDCx payments.

```typescript
import { cantonClient } from "@caypo/mpp-canton/client";

const client = cantonClient(config);
```

### Config

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ledgerUrl` | `string` | Yes | Canton JSON Ledger API URL (e.g., `http://localhost:7575`) |
| `token` | `string` | Yes | JWT bearer token for Canton authentication |
| `userId` | `string` | Yes | Ledger API user ID |
| `partyId` | `string` | Yes | Agent's Canton party ID |
| `network` | `"mainnet" \| "testnet" \| "devnet"` | Yes | Canton network |

### Methods

#### `client.createCredential({ challenge })`

Create a payment credential in response to a 402 challenge.

**Parameters:**
- `challenge.request.amount` — Required payment amount
- `challenge.request.currency` — `"USDCx"` or `"CC"`
- `challenge.request.recipient` — Server's party ID
- `challenge.request.network` — Network identifier

**Returns:** `Promise<string>` — Base64-encoded credential

**Throws:**
- `Error("Network mismatch")` — Challenge network doesn't match config
- `Error("Insufficient balance")` — Not enough USDCx holdings

## cantonServer(config)

Create a server for verifying Canton USDCx payments.

```typescript
import { cantonServer } from "@caypo/mpp-canton/server";

const server = cantonServer(config);
```

### Config

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ledgerUrl` | `string` | Yes | Canton JSON Ledger API URL |
| `token` | `string` | Yes | JWT bearer token |
| `userId` | `string` | Yes | Ledger API user ID |
| `recipientPartyId` | `string` | Yes | Gateway's Canton party ID |
| `network` | `"mainnet" \| "testnet" \| "devnet"` | Yes | Expected network |

### Methods

#### `server.verify({ credential })`

Verify a payment credential against the Canton ledger.

**Parameters:**
- `credential.payload.updateId` — Canton transaction ID
- `credential.payload.completionOffset` — Ledger offset
- `credential.payload.sender` — Payer's party ID
- `credential.payload.commandId` — Unique command ID

**Returns:** `Promise<{ method: "canton", reference: string, status: "success", timestamp: string }>`

**Throws:**
- `MppVerificationError("Network mismatch", "verification-failed")`
- `MppVerificationError("Recipient mismatch", "verification-failed")`
- `MppVerificationError("Transaction not found", "verification-failed")`
- `MppVerificationError("Payment insufficient", "payment-insufficient")`
- `MppVerificationError("Sender mismatch", "verification-failed")`

## Schemas

```typescript
import { requestSchema, credentialPayloadSchema, receiptSchema } from "@caypo/mpp-canton";

// Validate a payment request
const request = requestSchema.parse({
  amount: "0.01",
  currency: "USDCx",
  recipient: "Gateway::1220...",
  network: "mainnet",
});

// Validate credential payload
const payload = credentialPayloadSchema.parse({
  updateId: "abc123",
  completionOffset: 42,
  sender: "Agent::1220...",
  commandId: "uuid-here",
});
```

## MppVerificationError

```typescript
import { MppVerificationError } from "@caypo/mpp-canton";

try {
  await server.verify({ credential });
} catch (err) {
  if (err instanceof MppVerificationError) {
    err.message;     // Human-readable error
    err.problemCode; // "verification-failed" | "payment-insufficient"
  }
}
```
