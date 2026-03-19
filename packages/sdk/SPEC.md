# @cayvox/canton-sdk — Core SDK Specification (Production)

## Canton Client (Low-Level)

```typescript
export class CantonClient {
  constructor(config: {
    ledgerUrl: string;     // e.g., "http://localhost:7575"
    token: string;         // JWT bearer token
    userId: string;        // Ledger API user ID
  })

  // Command submission (verified v2 API)
  async submitAndWait(params: {
    commands: Command[];
    commandId: string;
    actAs: string[];
    readAs?: string[];
  }): Promise<{ updateId: string; completionOffset: number }>

  async submitAndWaitForTransaction(params: {
    commands: Command[];
    commandId: string;
    actAs: string[];
    readAs?: string[];
  }): Promise<TransactionResponse>

  // Active contract queries
  async queryActiveContracts(params: {
    filtersByParty?: Record<string, PartyFilter>;
    filtersForAnyParty?: AnyPartyFilter;
    activeAtOffset: number;
  }): Promise<ActiveContract[]>

  // Transaction lookup
  async getTransactionById(updateId: string): Promise<TransactionTree>

  // Ledger state
  async getLedgerEnd(): Promise<number>

  // Party management
  async allocateParty(hint: string): Promise<PartyDetails>
  async listParties(): Promise<PartyDetails[]>

  // Health check
  async isHealthy(): Promise<boolean>
}

// Command types (verified from Canton OpenAPI)
type Command =
  | { CreateCommand: { createArguments: any; templateId: string } }
  | { ExerciseCommand: { templateId: string; contractId: string; choice: string; choiceArgument: any } };

interface PartyDetails {
  party: string;           // e.g., "Alice::1220abcd..."
  isLocal: boolean;
  localMetadata: { resourceVersion: string; annotations: Record<string, string> };
  identityProviderId: string;
}
```

## USDCx Operations

```typescript
export class USDCxService {
  constructor(private client: CantonClient, private partyId: string)

  /** Query all USDCx Holding contracts for this party */
  async getHoldings(): Promise<USDCxHolding[]>

  /** Calculate total balance from all holdings */
  async getBalance(): Promise<string>

  /** Transfer USDCx via TransferFactory (requires recipient TransferPreapproval) */
  async transfer(params: {
    recipient: string;      // Recipient party ID
    amount: string;         // Decimal amount
    commandId?: string;     // Optional custom idempotency key
  }): Promise<TransferResult>

  /** Create a TransferInstruction (2-step, for when no preapproval exists) */
  async createTransferInstruction(params: {
    recipient: string;
    amount: string;
  }): Promise<TransferInstructionResult>

  /** Merge multiple holdings into fewer UTXOs */
  async mergeHoldings(holdingCids: string[]): Promise<string>
}

interface USDCxHolding {
  contractId: string;
  owner: string;           // Party ID
  amount: string;          // Decimal amount (up to 10 decimals)
  templateId: string;
}

interface TransferResult {
  updateId: string;
  completionOffset: number;
  commandId: string;
}
```

## CantonAgent (High-Level)

```typescript
export class CantonAgent {
  static async create(config?: Partial<AgentConfig>): Promise<CantonAgent>

  // Sub-services
  readonly checking: CheckingAccount;
  readonly savings: SavingsAccount;      // Phase 3
  readonly credit: CreditAccount;        // Phase 3
  readonly exchange: ExchangeAccount;    // Phase 3
  readonly invest: InvestmentAccount;    // Phase 4

  readonly safeguards: SafeguardManager;
  readonly traffic: TrafficManager;      // NOT "gas" — Canton uses traffic
  readonly mpp: MppPayClient;
  readonly wallet: WalletInfo;
}
```

## CheckingAccount

```typescript
export class CheckingAccount {
  /** Get USDCx balance */
  async balance(): Promise<{ available: string; holdingCount: number }>

  /** Send USDCx — uses TransferFactory_Transfer if preapproval exists,
      falls back to TransferInstruction (2-step) otherwise */
  async send(recipient: string, amount: string, opts?: {
    memo?: string;
    commandId?: string;
  }): Promise<TransferResult>

  /** Party ID for receiving payments */
  address(): string

  /** Transaction history via /v2/updates/flats */
  async history(opts?: { limit?: number }): Promise<TransactionRecord[]>
}
```

## TrafficManager (replaces "GasManager")

```typescript
/** Canton uses traffic budgets per validator, NOT per-transaction gas fees */
export class TrafficManager {
  /** Check validator's traffic balance */
  async trafficBalance(): Promise<{
    totalPurchased: number;
    consumed: number;
    remaining: number;
  }>

  /** Purchase additional traffic by burning CC */
  async purchaseTraffic(ccAmount: string): Promise<{ txId: string }>

  /** Check if sufficient traffic for an operation */
  async hasSufficientTraffic(): Promise<boolean>

  /** Auto-purchase configuration */
  setAutoPurchase(config: { enabled: boolean; minBalance: number; purchaseAmount: string }): void
}
```

## SafeguardManager

```typescript
export class SafeguardManager {
  settings(): SafeguardConfig
  setTxLimit(amount: string): void
  setDailyLimit(amount: string): void
  lock(): void
  unlock(pin: string): void
  check(amount: string): { allowed: boolean; reason?: string }
  recordSpend(amount: string): void
}

// Storage: ~/.canton-agent/safeguards.json
```

## Wallet Keystore

```typescript
export class Keystore {
  static async create(pin: string, path?: string): Promise<Keystore>
  static async load(pin: string, path?: string): Promise<Keystore>
  getCredentials(): { partyId: string; jwt: string }
  readonly address: string;  // Party ID
}

// Storage: ~/.canton-agent/wallet.key (AES-256-GCM encrypted)
```

## Configuration

```json
{
  "version": 2,
  "network": "mainnet",
  "ledgerUrl": "https://canton-node.example.com:7575",
  "partyId": "Agent::1220abcdef...",
  "userId": "ledger-api-user",
  "keystorePath": "~/.canton-agent/wallet.key",
  "traffic": {
    "autoPurchase": true,
    "minBalance": 1000,
    "purchaseAmountCC": "5.0"
  },
  "safeguards": {
    "txLimit": "100",
    "dailyLimit": "1000"
  },
  "mpp": {
    "gatewayUrl": "https://mpp.caypo.xyz",
    "maxAutoPayPrice": "1.00"
  }
}
```
