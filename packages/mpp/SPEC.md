# @cayvox/mpp-canton — MPP Payment Method Specification (Production)

## Transfer Flow for MPP

**The critical insight:** The MPP gateway server MUST have a `TransferPreapproval` contract active. This enables 1-step transfers from agents — no receiver acceptance needed.

```
Agent                          Gateway (Canton)                    Canton Ledger
  |                               |                                    |
  |-- GET /api/data ------------->|                                    |
  |<-- 402 + Challenge -----------|                                    |
  |                               |                                    |
  |   (Agent exercises TransferFactory_Transfer                        |
  |    using gateway's TransferPreapproval)                            |
  |                               |                                    |
  |-- POST /v2/commands/submit-and-wait -------------------------------->|
  |<-- { updateId, completionOffset } ----------------------------------|
  |                               |                                    |
  |-- GET /api/data + credential->|                                    |
  |                               |-- verify via /v2/updates/... ----->|
  |                               |<-- transaction tree ---------------|
  |<-- 200 + Receipt + data ------|                                    |
```

## Method Definition

```typescript
import { Method, z } from "mppx";

export const cantonMethod = Method.from({
  intent: "charge",
  name: "canton",
  schema: {
    credential: {
      payload: z.object({
        updateId: z.string().min(1),
        completionOffset: z.number().int(),
        sender: z.string().min(1),          // e.g., "Agent::1220abcd..."
        commandId: z.string().min(1),
      }),
    },
    request: z.object({
      amount: z.string().regex(/^\d+\.?\d{0,10}$/),
      currency: z.enum(["USDCx", "CC"]),
      recipient: z.string().min(1),         // e.g., "Gateway::1220efgh..."
      network: z.enum(["mainnet", "testnet", "devnet"]),
      description: z.string().optional(),
      expiry: z.number().int().min(1).max(3600).default(300),
    }),
  },
});
```

Note: Canton uses `Numeric 10` (10 decimal places) internally. USDCx has 6 meaningful decimals but the on-chain representation may use 10.

## Client Implementation

```typescript
import { Method, Credential } from "mppx";
import { cantonMethod } from "./method";

export interface CantonClientConfig {
  ledgerUrl: string;       // e.g., "http://localhost:7575"
  token: string;           // JWT bearer token
  userId: string;          // Ledger API user ID
  partyId: string;         // Agent's party ID (e.g., "Agent::1220...")
  network: "mainnet" | "testnet" | "devnet";
}

export function cantonClient(config: CantonClientConfig) {
  return Method.toClient(cantonMethod, {
    async createCredential({ challenge }) {
      // 1. Validate network
      if (challenge.request.network !== config.network) {
        throw new Error(`Network mismatch: expected ${config.network}`);
      }

      // 2. Query agent's USDCx holdings
      const holdingsResponse = await fetch(
        `${config.ledgerUrl}/v2/state/active-contracts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.token}`,
          },
          body: JSON.stringify({
            eventFormat: {
              filtersByParty: {
                [config.partyId]: {
                  cumulative: [{
                    identifierFilter: {
                      TemplateFilter: {
                        value: { templateId: USDCX_HOLDING_TEMPLATE_ID }
                      }
                    }
                  }]
                }
              },
              verbose: true
            },
            activeAtOffset: await getLedgerEnd(config),
          }),
        }
      );

      // 3. Select holdings covering the amount
      const holdings = parseHoldings(await holdingsResponse.json());
      const selected = selectHoldings(holdings, challenge.request.amount);

      // 4. Generate unique commandId
      const commandId = crypto.randomUUID();

      // 5. Exercise TransferFactory_Transfer via submit-and-wait
      const submitResponse = await fetch(
        `${config.ledgerUrl}/v2/commands/submit-and-wait`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.token}`,
          },
          body: JSON.stringify({
            commands: [{
              ExerciseCommand: {
                templateId: TRANSFER_FACTORY_TEMPLATE_ID,
                contractId: selected.transferFactoryContractId,
                choice: "TransferFactory_Transfer",
                choiceArgument: {
                  sender: config.partyId,
                  receiver: challenge.request.recipient,
                  amount: challenge.request.amount,
                  instrumentId: USDCX_INSTRUMENT_ID,
                  inputHoldingCids: selected.holdingContractIds,
                  meta: {},
                },
              },
            }],
            userId: config.userId,
            commandId,
            actAs: [config.partyId],
            readAs: [config.partyId],
          }),
        }
      );

      const result = await submitResponse.json();

      // 6. Return credential
      return Credential.serialize({
        challenge,
        payload: {
          updateId: result.updateId,
          completionOffset: result.completionOffset,
          sender: config.partyId,
          commandId,
        },
      });
    },
  });
}
```

## Server Implementation

```typescript
import { Method, Receipt } from "mppx";
import { cantonMethod } from "./method";

export interface CantonServerConfig {
  ledgerUrl: string;
  token: string;
  userId: string;
  recipientPartyId: string;
  network: "mainnet" | "testnet" | "devnet";
}

export function cantonServer(config: CantonServerConfig) {
  return Method.toServer(cantonMethod, {
    async verify({ credential }) {
      const { updateId, completionOffset, sender, commandId } = credential.payload;
      const { amount, recipient, network } = credential.challenge.request;

      // 1. Network check
      if (network !== config.network) {
        throw new Error("Network mismatch");
      }

      // 2. Recipient check
      if (recipient !== config.recipientPartyId) {
        throw new Error("Recipient mismatch");
      }

      // 3. Fetch transaction by updateId
      const txResponse = await fetch(
        `${config.ledgerUrl}/v2/updates/transaction-by-id/${updateId}`,
        {
          headers: {
            "Authorization": `Bearer ${config.token}`,
          },
        }
      );

      if (!txResponse.ok) {
        throw new Error("Transaction not found on Canton ledger");
      }

      const tx = await txResponse.json();

      // 4. Verify: find the created Holding event for recipient
      const recipientHolding = findCreatedHolding(tx, config.recipientPartyId);
      if (!recipientHolding) {
        throw new Error("No holding created for recipient");
      }

      // 5. Verify amount >= required
      if (parseFloat(recipientHolding.amount) < parseFloat(amount)) {
        throw new Error(`Insufficient: ${recipientHolding.amount} < ${amount}`);
      }

      // 6. Verify sender
      const senderEvent = findExercisedEvent(tx, sender);
      if (!senderEvent) {
        throw new Error("Sender mismatch");
      }

      // 7. Return receipt
      return Receipt.from({
        method: "canton",
        reference: updateId,
        status: "success",
        timestamp: new Date().toISOString(),
      });
    },
  });
}
```

## Gateway TransferPreapproval Setup

The gateway MUST run this setup once before accepting payments:

```typescript
// One-time setup: Create TransferPreapproval for gateway party
// This allows agents to do 1-step transfers to the gateway
async function setupGatewayPreapproval(config: CantonServerConfig) {
  // Option A: Via validator API (if using Splice wallet)
  // POST /v0/admin/external-party/setup-proposal
  
  // Option B: Via Ledger API (direct)
  // Exercise the appropriate TransferPreapproval creation choice
  // on the token registry
  
  // The preapproval must be renewed before expiry (default: $1/year fee)
}
```

## Error Mapping

| Canton Error | MPP Problem Code | HTTP |
|-------------|-----------------|------|
| Transaction not found | verification-failed | 402 |
| Amount insufficient | payment-insufficient | 402 |
| Wrong recipient | verification-failed | 402 |
| Wrong network | verification-failed | 402 |
| Duplicate commandId | verification-failed | 402 |
| INVALID_ARGUMENT | malformed-credential | 402 |
| PERMISSION_DENIED | verification-failed | 402 |
| UNAVAILABLE | N/A | 503 |
