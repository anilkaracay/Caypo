# @caypo/mpp-canton

MPP (Micropayment Protocol) payment method for Canton Network. Enables AI agents to pay for API calls using USDCx via CIP-56 TransferPreapproval.

## Install

```bash
pnpm add @caypo/mpp-canton
```

## Usage

### Client (Agent paying for APIs)

```typescript
import { cantonClient } from "@caypo/mpp-canton/client";

const client = cantonClient({
  ledgerUrl: "http://localhost:7575",
  token: "jwt-token",
  userId: "ledger-api-user",
  partyId: "Agent::1220...",
  network: "testnet",
});

const credential = await client.createCredential({ challenge });
```

### Server (Gateway verifying payments)

```typescript
import { cantonServer } from "@caypo/mpp-canton/server";

const server = cantonServer({
  ledgerUrl: "http://localhost:7575",
  token: "jwt-token",
  userId: "ledger-api-user",
  recipientPartyId: "Gateway::1220...",
  network: "testnet",
});

const receipt = await server.verify({ credential });
```

## API

- `cantonMethod` - Method definition (name: "canton", intent: "charge")
- `cantonClient(config)` - Create client for paying
- `cantonServer(config)` - Create server for verifying
- `requestSchema` / `credentialPayloadSchema` - Zod schemas
- `MppVerificationError` - Error with `problemCode` field

## License

Apache-2.0 OR MIT
