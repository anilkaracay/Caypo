# Canton Agent — Master Specification (Production)

> **Version:** 2.0 (corrected against live Canton documentation)
> **Organization:** Cayvox Labs
> **Canton Version Target:** 3.4.x (JSON Ledger API v2)
> **Sources verified:** docs.digitalasset.com, docs.sync.global, hyperledger-labs/splice

---

## 1. Canton Network — Verified Technical Facts

### 1.1 JSON Ledger API v2 Endpoints

Canton 3.3+ uses the JSON Ledger API v2. Default port: **7575**.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/commands/submit-and-wait` | POST | Submit commands, wait for completion. Returns `{ updateId, completionOffset }` |
| `/v2/commands/submit-and-wait-for-transaction` | POST | Submit commands, return full transaction with events |
| `/v2/commands/submit-and-wait-for-transaction-tree` | POST | Submit commands, return transaction tree (deprecated in 3.5, use above) |
| `/v2/commands/async/submit` | POST | Submit command asynchronously |
| `/v2/state/active-contracts` | POST | Query active contracts (ACS) at an offset |
| `/v2/state/ledger-end` | GET | Get current ledger end offset |
| `/v2/state/latest-pruned-offsets` | GET | Get latest pruned offsets |
| `/v2/parties` | POST | Allocate a new party |
| `/v2/parties` | GET | List known parties |
| `/v2/updates/transaction-by-id/{updateId}` | GET | Get transaction by update ID |
| `/v2/updates/flats` | WebSocket/POST | Stream flat transactions |
| `/v2/packages` | POST | Upload DAR package |
| `/v2/packages/{package-id}` | GET | Download package |
| `/livez` | GET | Health check |
| `/docs/openapi` | GET | OpenAPI specification |

**Authentication:** Every request requires a JWT bearer token.

```
Authorization: Bearer <jwt-token>
```

For development/sandbox without auth, a self-signed JWT can be used via jwt.io.

### 1.2 Party ID Format (Verified)

Format: `<DisplayName>::<hex-fingerprint>`

Real example from Canton docs:
```
Alice::122084768362d0ce21f1ffec870e55e365a292cdf8f54c5c38ad7775b9bdd462e141
```

Party allocation request:
```bash
curl -d '{"partyIdHint":"Alice", "identityProviderId": ""}' \
  -H "Content-Type: application/json" \
  -X POST localhost:7575/v2/parties
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

### 1.3 Command Submission Format (Verified)

All commands use the `/v2/commands/submit-and-wait` endpoint with this structure:

```json
{
  "commands": [
    {
      "CreateCommand": {
        "createArguments": { ... },
        "templateId": "#package-name:Module:Template"
      }
    }
  ],
  "userId": "ledger-api-user",
  "commandId": "unique-command-id-1234",
  "actAs": ["Alice::1220..."],
  "readAs": ["Alice::1220..."]
}
```

For exercising choices:
```json
{
  "commands": [
    {
      "ExerciseCommand": {
        "templateId": "packagehash:Module:Template",
        "contractId": "00572c50...",
        "choice": "ChoiceName",
        "choiceArgument": { ... }
      }
    }
  ],
  "userId": "ledger-api-user",
  "commandId": "unique-command-id-5678",
  "actAs": ["Alice::1220..."]
}
```

Successful response:
```json
{
  "updateId": "...",
  "completionOffset": 20
}
```

### 1.4 Active Contract Query (Verified)

```json
// POST /v2/state/active-contracts
{
  "eventFormat": {
    "filtersByParty": {},
    "filtersForAnyParty": {
      "cumulative": [
        {
          "identifierFilter": {
            "WildcardFilter": {
              "value": { "includeCreatedEventBlob": true }
            }
          }
        }
      ]
    },
    "verbose": false
  },
  "activeAtOffset": 20
}
```

Response contains `createdEvent` objects with `contractId`, `templateId`, `createArgument`.

### 1.5 Token Standard Transfer — THE CRITICAL MECHANISM

Canton Network Token Standard (CIP-56) defines TWO transfer patterns:

#### Pattern A: 1-Step Transfer (via TransferPreapproval) — PREFERRED FOR MPP

If the **receiver** has a `TransferPreapproval` contract active, the sender can transfer in a single transaction using `TransferFactory_Transfer`.

The `TransferFactory_Transfer` choice accepts:
```
{
  sender: Party,
  receiver: Party,
  amount: Numeric 10,
  instrumentId: InstrumentKey,
  requestedAt: Time,
  executeBefore: Time,
  inputHoldingCids: [ContractId Holding],
  meta: TransferMeta
}
```

**This is the pattern mpp-canton MUST use.** The MPP gateway server sets up a TransferPreapproval once, and then all agent payments use 1-step transfers.

#### Pattern B: 2-Step Transfer (via TransferInstruction)

Without a preapproval:
1. Sender creates a `TransferInstruction` 
2. Receiver exercises `TransferInstruction_Accept`

This requires two transactions and receiver automation. NOT suitable for MPP's synchronous 402 flow.

#### MPP Gateway Setup Requirement

The gateway server MUST:
1. Set up a `TransferPreapproval` contract for its party
2. Keep the preapproval active (renew before expiry — default fee is $1/year)
3. Use the Token Standard APIs for transfer verification

### 1.6 Traffic System (NOT Traditional Gas)

Canton does NOT have a traditional gas model. Instead:

- Each **validator** has a traffic budget (bandwidth allocation)
- A base amount of traffic is free
- Additional traffic is purchased by **burning Canton Coin (CC)**
- Traffic is consumed by submitting transactions to the synchronizer
- Auto-purchase can be configured on the validator

For an agent making payments, the agent's validator must have sufficient traffic. The agent does not directly pay gas — the validator's traffic budget covers it.

**Implication for Canton Agent:** The "gas manager" concept must be reframed as "traffic management" — ensuring the validator has sufficient traffic, and optionally auto-purchasing traffic with CC.

### 1.7 USDCx on Canton (Verified)

- Deployed via Circle xReserve (December 2025)
- CIP-56 compliant (implements HoldingV1, TransferFactory, TransferInstruction interfaces)
- 1:1 backed by USDC on Ethereum
- Mint: Deposit USDC to xReserve on Ethereum → Mint USDCx on Canton
- Redeem: Burn USDCx on Canton → Release USDC on Ethereum
- Cross-chain via Circle CCTP and Circle Gateway
- Privacy-preserving: Canton's sub-transaction privacy applies

### 1.8 Wallet SDK (Official)

The official wallet integration SDK:

```
@canton-network/wallet-sdk   — Low-level SDK for wallet providers
@canton-network/dapp-sdk     — Higher-level SDK for dApp developers
```

Source: `hyperledger-labs/splice-wallet-kernel`

The Wallet Gateway implements CIP-103 (dApp API) as a JSON-RPC 2.0 interface.

Architecture:
```
dApp (dApp SDK) ←→ Wallet Gateway ←→ Canton Validator (Ledger API)
                                  ←→ Signing Provider (Participant, Fireblocks, ...)
```

### 1.9 Holding UTXO Model

Canton uses a UTXO-like model for token holdings:
- Each Holding contract is a "UTXO"
- A party can have multiple Holdings
- Recommended: keep under ~10 UTXOs per user
- Canton Coin allows max 100 input contracts per transfer
- MergeDelegation contracts enable automated UTXO consolidation

---

## 2. Monorepo Structure

```
canton-agent/
├── packages/
│   ├── mpp/              @cayvox/mpp-canton
│   ├── sdk/              @cayvox/canton-sdk
│   ├── cli/              @cayvox/canton-cli
│   ├── mcp/              @cayvox/canton-mcp
│   └── gateway/          @cayvox/canton-gateway
├── apps/
│   ├── web/              Landing page
│   └── gateway-server/   Gateway deployment
├── skills/               Agent skills
├── package.json          pnpm workspace root
├── turbo.json            Turborepo config
└── tsconfig.base.json    Shared TS config
```

---

## 3. Feature Parity with t2000

| t2000 (Sui) | Canton Agent | Canton Mechanism | Status |
|-------------|-------------|-----------------|--------|
| Checking (USDC send/receive) | Checking (USDCx) | CIP-56 HoldingV1 + TransferFactory | Spec'd |
| Balance query | Balance query | `/v2/state/active-contracts` query for Holding | Spec'd |
| Savings (Navi/Suilend yield) | Savings (Canton DeFi) | DeFi protocol integration (TBD) | Phase 3 |
| Credit (borrow/repay) | Credit | Lending protocol integration (TBD) | Phase 3 |
| Exchange (Cetus DEX) | Exchange (Temple) | Temple DEX integration (TBD) | Phase 3 |
| Investment (buy/sell/DCA) | Investment | Canton assets + strategies | Phase 4 |
| MPP payment method | MPP payment method | CIP-56 TransferPreapproval + TransferFactory | Spec'd |
| MPP Gateway (17 services) | MPP Gateway (17 services) | Hono proxy with mppx | Spec'd |
| MCP server (33 tools, 20 prompts) | MCP server | @modelcontextprotocol/sdk | Spec'd |
| CLI tool | CLI tool | commander + chalk | Spec'd |
| Agent Skills (10) | Agent Skills (10) | YAML skill definitions | Spec'd |
| Safeguards | Safeguards | SDK-level enforcement | Spec'd |
| Gas management | Traffic management | Validator traffic + CC burn | Spec'd |
| Wallet encryption | Wallet encryption | AES-256-GCM + PBKDF2 | Spec'd |
| x402 payments | ShadowCall (exists) | Separate Cayvox product | Done |

---

## 4. Implementation Priority

### Phase 1 (Week 1-2): Foundation
1. Monorepo setup (pnpm + turbo + tsup + vitest)
2. `@cayvox/mpp-canton` — MPP payment method using CIP-56 TransferPreapproval
3. `@cayvox/canton-sdk` core — Canton JSON API v2 client, JWT auth, USDCx Holding queries, TransferFactory transfers
4. `@cayvox/canton-cli` basics — init, balance, send, address

### Phase 2 (Week 3-4): Agent Platform
5. `@cayvox/canton-mcp` — MCP server (start with 15 core tools)
6. Safeguards (tx limit, daily limit, lock)
7. Traffic management (validator traffic monitoring + CC auto-purchase)
8. Agent skills for Claude Code

### Phase 3 (Week 5-6): Gateway + DeFi
9. `@cayvox/canton-gateway` — MPP proxy (OpenAI, Anthropic, etc.)
10. Savings integration (when Canton DeFi protocols are available)
11. Exchange integration (Temple DEX when available)

### Phase 4 (Week 7-8): Polish
12. Investment account
13. Credit account
14. Landing page
15. npm publish

---

## 5. Canton-Specific Advantages (Marketing)

1. **Privacy-Preserving Agent Payments** — Payment details only visible to sender + receiver
2. **Institutional Compliance** — Partners: DTCC, Goldman Sachs, JPMorgan, BNP Paribas
3. **USDCx via Circle xReserve** — Institutional-grade stablecoin with cross-chain interop
4. **Atomic Cross-App Settlement** — Pay + settle in one transaction
5. **Regulatory Alignment** — Basel III compliant infrastructure
6. **CC Mining Rewards** — Apps earn CC rewards based on usage (Cantonomics)
