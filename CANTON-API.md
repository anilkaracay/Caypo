# Canton JSON Ledger API v2 — Quick Reference (Verified)

> Sources: docs.digitalasset.com/build/3.5, Canton OpenAPI spec v3.3.0
> Default port: 7575

## Authentication

```
Authorization: Bearer <jwt-token>
```

JWT scope: `daml_ledger_api` (default, configurable).

## Endpoints

### POST /v2/commands/submit-and-wait

Submit commands synchronously.

Request:
```json
{
  "commands": [
    {
      "CreateCommand": {
        "createArguments": { "issuer": "Alice::1220...", "owner": "Alice::1220...", "name": "Asset" },
        "templateId": "#json-tests:Main:Asset"
      }
    }
  ],
  "userId": "ledger-api-user",
  "commandId": "unique-id-1234",
  "actAs": ["Alice::1220..."],
  "readAs": ["Alice::1220..."]
}
```

Response: `{ "updateId": "...", "completionOffset": 20 }`

### POST /v2/commands/submit-and-wait-for-transaction

Same request, returns full transaction with events.

### ExerciseCommand format

```json
{
  "commands": [
    {
      "ExerciseCommand": {
        "templateId": "packagehash:Module:Template",
        "contractId": "00572c50...",
        "choice": "ChoiceName",
        "choiceArgument": { "field": "value" }
      }
    }
  ],
  "userId": "ledger-api-user",
  "commandId": "unique-id-5678",
  "actAs": ["Alice::1220..."]
}
```

### POST /v2/state/active-contracts

Query active contracts at a specific offset.

```json
{
  "eventFormat": {
    "filtersByParty": {
      "Alice::1220...": {
        "cumulative": [{
          "identifierFilter": {
            "TemplateFilter": {
              "value": { "templateId": "packagehash:Module:Template" }
            }
          }
        }]
      }
    },
    "verbose": true
  },
  "activeAtOffset": 20
}
```

Use `WildcardFilter` instead of `TemplateFilter` to get all contracts.

### GET /v2/state/ledger-end

Returns: `{ "offset": 42 }`

### POST /v2/parties

Allocate party:
```json
{ "partyIdHint": "Alice", "identityProviderId": "" }
```

Response:
```json
{
  "partyDetails": {
    "party": "Alice::122084768362d0ce21f1ffec870e55e365a292cdf8f54c5c38ad7775b9bdd462e141",
    "isLocal": true,
    "localMetadata": { "resourceVersion": "0", "annotations": {} },
    "identityProviderId": ""
  }
}
```

### GET /v2/updates/transaction-by-id/{updateId}

Fetch a specific transaction for verification.

### GET /livez

Health check. Returns 200 if server is running.

### GET /docs/openapi

Full OpenAPI spec (YAML).

## Party ID Format

`<DisplayName>::<hex-fingerprint>`

Example: `Alice::122084768362d0ce21f1ffec870e55e365a292cdf8f54c5c38ad7775b9bdd462e141`

## Template ID Formats

- Short: `#package-name:Module:Template` (resolved by sandbox)
- Full: `packagehash:Module:Template` (production)

## Token Standard (CIP-56) Interfaces

- `Splice.Api.Token.HoldingV1:Holding` — Token balance
- `Splice.Api.Token.TransferInstructionV1:TransferInstruction` — 2-step transfer
- `Splice.Api.Token.AllocationV1:Allocation` — Token allocation

Key choices:
- `TransferFactory_Transfer` — 1-step transfer (requires TransferPreapproval)
- `TransferInstruction_Accept` — Accept 2-step transfer
- `TransferInstruction_Reject` — Reject transfer
- `TransferInstruction_Withdraw` — Withdraw transfer

## Error Format

```json
{
  "cause": "description",
  "code": "INVALID_ARGUMENT",
  "context": { "category": "8", "participant": "participant1" },
  "errorCategory": 8,
  "grpcCodeValue": 3
}
```

Common codes: INVALID_ARGUMENT, NOT_FOUND, PERMISSION_DENIED, ALREADY_EXISTS, FAILED_PRECONDITION, UNAVAILABLE

## Amount Format

- Internal: `Numeric 10` (10 decimal places)
- USDCx: 6 meaningful decimals
- Always use strings, never floating-point
- Example: `"1.500000"` or `"0.01"`
