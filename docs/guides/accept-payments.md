# Accept Payments — Add Canton USDCx to Your API

Accept instant USDCx payments from AI agents via the Machine Payments Protocol (MPP).

## 1. Install

```bash
npm install @caypo/mpp-canton hono
```

## 2. Set Up TransferPreapproval

Your Canton party needs a `TransferPreapproval` contract. This enables agents to pay you in a single transaction. See the [setup guide](../../scripts/setup-preapproval.ts).

## 3. Configure the Server

```typescript
import { cantonServer, MppVerificationError } from "@caypo/mpp-canton/server";

const server = cantonServer({
  ledgerUrl: process.env.CANTON_LEDGER_URL!,
  token: process.env.CANTON_JWT!,
  userId: "ledger-api-user",
  recipientPartyId: process.env.GATEWAY_PARTY_ID!,
  network: "mainnet",
});
```

## 4. Add Payment Gate to Routes

Using Hono (or any framework):

```typescript
import { Hono } from "hono";

const app = new Hono();

app.post("/api/data", async (c) => {
  const authHeader = c.req.header("Authorization") ?? "";

  // No payment? Return 402 challenge
  if (!authHeader.startsWith("Payment ")) {
    return c.text("Payment Required", 402, {
      "WWW-Authenticate": `Payment method="canton", amount="0.01", currency="USDCx", recipient="${process.env.GATEWAY_PARTY_ID}", network="mainnet"`,
    });
  }

  // Verify payment
  const credentialBase64 = authHeader.replace("Payment ", "");
  try {
    const credential = JSON.parse(Buffer.from(credentialBase64, "base64").toString());
    const receipt = await server.verify({
      credential: {
        challenge: { request: { amount: "0.01", currency: "USDCx", recipient: process.env.GATEWAY_PARTY_ID!, network: "mainnet", expiry: 300 } },
        payload: credential,
      },
    });

    // Payment verified — serve the response
    const data = { message: "Here is your data" };
    return c.json(data, 200, {
      "Payment-Receipt": Buffer.from(JSON.stringify(receipt)).toString("base64"),
    });
  } catch (err) {
    if (err instanceof MppVerificationError) {
      return c.json({ error: err.message, code: err.problemCode }, 402);
    }
    return c.json({ error: "Payment verification failed" }, 402);
  }
});
```

## 5. Test with the CLI

```bash
caypo pay http://localhost:3000/api/data --max-price 0.05
```

## How It Works

```
Agent → POST /api/data                    → 402 + WWW-Authenticate
Agent → USDCx transfer on Canton          → ~1-3 seconds
Agent → POST /api/data + credential       → 200 + data + receipt
```

The payment settles atomically on Canton. No chargebacks, no pending states.

## Pricing Strategies

- **Fixed price**: Same price for every request
- **Dynamic**: Price based on model, token count, or compute
- **Tiered**: Lower price for bulk users (track by party ID)

## Error Handling

| Error | Problem Code | Action |
|-------|-------------|--------|
| Wrong network | `verification-failed` | Check network config |
| Wrong recipient | `verification-failed` | Check party ID |
| Transaction not found | `verification-failed` | Agent may have submitted to wrong node |
| Amount too low | `payment-insufficient` | Agent's amount < required |
| Invalid credential | `malformed-credential` | Corrupted base64 or JSON |
