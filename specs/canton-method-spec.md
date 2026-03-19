# Canton Network Charge Intent Specification

> **Method identifier:** `canton`
> **Intent:** `charge`
> **Version:** 1.0.0
> **Status:** Draft
> **Authors:** Cayvox Labs
> **Implementation:** [@caypo/mpp-canton](https://www.npmjs.com/package/@caypo/mpp-canton)

## Abstract

This specification defines the `canton` payment method for the Machine Payments Protocol (MPP). It enables HTTP services to accept payments in USDCx (Circle's USDC-backed stablecoin on Canton Network) using the CIP-56 token standard's TransferPreapproval mechanism for atomic 1-step settlement.

Canton Network provides sub-transaction privacy — payment details are only visible to sender and receiver — making it suitable for institutional and compliance-sensitive agent payment flows.

## 1. Method Identifier

```
method = "canton"
intent = "charge"
```

## 2. Request Schema

The payment challenge issued by the server in the `WWW-Authenticate` header.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | `string` | Yes | Payment amount. Regex: `^\d+\.?\d{0,10}$`. Canton uses Numeric 10 internally. |
| `currency` | `enum` | Yes | `"USDCx"` or `"CC"` (Canton Coin) |
| `recipient` | `string` | Yes | Server's Canton party ID. Format: `<DisplayName>::<hex-fingerprint>` |
| `network` | `enum` | Yes | `"mainnet"`, `"testnet"`, or `"devnet"` |
| `description` | `string` | No | Human-readable payment description |
| `expiry` | `integer` | No | Seconds until challenge expires. Range: 1–3600. Default: 300 |

### WWW-Authenticate Header Format

```
WWW-Authenticate: Payment method="canton", amount="0.01", currency="USDCx",
  recipient="Gateway::1220abcdef...", network="mainnet", description="API call"
```

## 3. Credential Payload Schema

The payment proof submitted by the client in the `Authorization` header.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `updateId` | `string` | Yes | Canton transaction update ID returned by `submit-and-wait` |
| `completionOffset` | `integer` | Yes | Ledger offset at which the transaction completed |
| `sender` | `string` | Yes | Client's Canton party ID |
| `commandId` | `string` | Yes | Unique command ID used for the transfer (idempotency key) |

### Authorization Header Format

```
Authorization: Payment <base64(JSON(payload))>
```

### Payload Example

```json
{
  "updateId": "0123456789abcdef",
  "completionOffset": 1479200,
  "sender": "Agent::1220abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  "commandId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

## 4. Settlement Procedure

### Prerequisites

The server (payment recipient) MUST have an active `TransferPreapproval` contract on Canton. This enables 1-step atomic transfers without requiring the receiver to accept each payment.

### Client Settlement Steps

1. Parse the `WWW-Authenticate` challenge header
2. Validate `network` matches client configuration
3. Query client's USDCx Holding contracts via `POST /v2/state/active-contracts`
4. Select holdings covering the required `amount` (UTXO selection)
5. Generate a unique `commandId` via `crypto.randomUUID()`
6. Submit `ExerciseCommand` for `TransferFactory_Transfer` via `POST /v2/commands/submit-and-wait`:

```json
{
  "commands": [{
    "ExerciseCommand": {
      "templateId": "Splice.Api.Token.TransferFactoryV1:TransferFactory",
      "contractId": "<transfer-factory-contract-id>",
      "choice": "TransferFactory_Transfer",
      "choiceArgument": {
        "sender": "<client-party-id>",
        "receiver": "<server-party-id>",
        "amount": "<amount>",
        "instrumentId": "USDCx",
        "inputHoldingCids": ["<holding-contract-ids>"],
        "meta": {}
      }
    }
  }],
  "userId": "<ledger-api-user>",
  "commandId": "<uuid>",
  "actAs": ["<client-party-id>"],
  "readAs": ["<client-party-id>"]
}
```

7. Receive `{ updateId, completionOffset }` from Canton
8. Build credential payload and encode as base64 JSON
9. Retry the original request with `Authorization: Payment <credential>`

### Canton API Reference

- Submit: `POST /v2/commands/submit-and-wait`
- Query holdings: `POST /v2/state/active-contracts`
- Ledger end: `GET /v2/state/ledger-end`
- Default port: 7575

## 5. Verification Procedure

The server MUST perform these checks in order:

1. **Decode credential**: Base64-decode and JSON-parse the `Authorization: Payment` header value
2. **Network check**: Verify `credential.challenge.request.network` matches server's network
3. **Recipient check**: Verify `credential.challenge.request.recipient` matches server's party ID
4. **Fetch transaction**: `GET /v2/updates/transaction-by-id/{updateId}` from Canton ledger
5. **Holding verification**: Find a `CreatedEvent` in the transaction where:
   - The Holding contract's `signatories` or `witnessParties` includes the server's party ID
   - The `createArgument.amount` >= the required payment amount
6. **Sender verification**: Find an `ExercisedEvent` where `actingParties` includes `credential.sender`
7. **Issue receipt**: If all checks pass, return the response with a `Payment-Receipt` header

### Failure Modes

If any verification step fails, the server MUST return HTTP 402 with an error body:

```json
{
  "error": "<error-description>",
  "code": "<problem-code>"
}
```

## 6. Receipt Format

```json
{
  "method": "canton",
  "reference": "<updateId>",
  "status": "success",
  "timestamp": "<ISO-8601>"
}
```

Delivered as base64-encoded JSON in the `Payment-Receipt` response header.

## 7. Error Codes

| Problem Code | Cause | HTTP |
|-------------|-------|------|
| `verification-failed` | Transaction not found, wrong network, wrong recipient, sender mismatch | 402 |
| `payment-insufficient` | Received amount less than required | 402 |
| `malformed-credential` | Cannot parse credential payload | 402 |

Canton-specific errors that may propagate:

| Canton Error Code | Description |
|-------------------|-------------|
| `INVALID_ARGUMENT` | Malformed command |
| `NOT_FOUND` | Template or contract not found |
| `PERMISSION_DENIED` | Party not authorized |
| `ALREADY_EXISTS` | Duplicate commandId |
| `FAILED_PRECONDITION` | Contract already consumed |
| `UNAVAILABLE` | Node unreachable |

## 8. Security Considerations

### Canton Privacy Model

Canton Network provides **sub-transaction privacy**:
- Only the sender and receiver see the payment details
- Validators process transactions without seeing contract arguments
- No public mempool or block explorer exposure

### Amount Handling

- All amounts MUST be strings (never floating point)
- Canton uses `Numeric 10` (10 decimal places) internally
- USDCx has 6 meaningful decimal places
- Implementations SHOULD validate amounts against the regex `^\d+\.?\d{0,10}$`

### Party ID Format

Canton party IDs follow the format `<DisplayName>::<hex-fingerprint>` where the fingerprint is a 64-character hex string derived from the party's key pair.

### Idempotency

The `commandId` field ensures idempotency. Canton rejects duplicate `commandId` values, preventing double-payment. Clients MUST generate a unique `commandId` for each payment attempt.

### TransferPreapproval

The server's `TransferPreapproval` contract:
- Enables 1-step transfers (no acceptance workflow)
- Must be renewed before expiry (default: $1/year fee)
- If expired, agents cannot complete payments (402 loop)

## 9. Supported Currencies

| Currency | Description | Decimals | Backing |
|----------|-------------|----------|---------|
| `USDCx` | Circle xReserve stablecoin | 6 (10 on-chain) | 1:1 USDC on Ethereum |
| `CC` | Canton Coin | 10 | Native utility token |

## 10. Network Identifiers

| Network | Description | Use |
|---------|-------------|-----|
| `mainnet` | Canton mainnet (Global Synchronizer) | Production |
| `testnet` | Canton testnet | Staging |
| `devnet` | Canton DevNet (Splice validators) | Development |

## 11. Reference Implementation

- **npm package**: [@caypo/mpp-canton](https://www.npmjs.com/package/@caypo/mpp-canton)
- **Client**: `import { cantonClient } from "@caypo/mpp-canton/client"`
- **Server**: `import { cantonServer } from "@caypo/mpp-canton/server"`
- **Source**: [github.com/anilkaracay/Caypo](https://github.com/anilkaracay/Caypo)

## 12. References

- [MPP Protocol Specification](https://mpp.dev)
- [Canton Network Documentation](https://docs.canton.network)
- [CIP-56: Canton Token Standard](https://canton.network)
- [Canton JSON Ledger API v2](https://docs.digitalasset.com/build/3.5)
- [Circle xReserve (USDCx)](https://www.circle.com)
- [Splice Wallet SDK](https://github.com/hyperledger-labs/splice-wallet-kernel)
