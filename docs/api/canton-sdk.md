# @caypo/canton-sdk — API Reference

Core SDK for AI agent banking on Canton Network.

## CantonAgent

High-level entry point that wires all services together.

```typescript
import { CantonAgent } from "@caypo/canton-sdk";
```

### `CantonAgent.create(config?)`

Create from config file (`~/.caypo/config.json`).

| Parameter | Type | Description |
|-----------|------|-------------|
| `ledgerUrl` | `string` | Canton ledger URL |
| `token` | `string` | JWT bearer token |
| `userId` | `string` | Ledger API user ID |
| `partyId` | `string` | Agent's party ID |
| `network` | `"mainnet" \| "testnet" \| "devnet"` | Network |

### `CantonAgent.fromParams(params)`

Create without file I/O (for testing).

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `checking` | `CheckingAccount` | USDCx balance, send, history |
| `savings` | `SavingsAccount` | Yield deposits, earnings |
| `credit` | `CreditAccount` | Borrow against collateral |
| `exchange` | `ExchangeAccount` | Swap USDCx/CC |
| `invest` | `InvestmentAccount` | Portfolio, strategies, DCA |
| `safeguards` | `SafeguardManager` | Spending limits, lock |
| `traffic` | `TrafficManager` | Validator traffic |
| `mpp` | `MppPayClient` | HTTP 402 auto-pay |
| `wallet` | `WalletInfo` | address, partyId, network |

---

## CantonClient

Low-level Canton JSON Ledger API v2 client.

```typescript
import { CantonClient } from "@caypo/canton-sdk";
const client = new CantonClient({ ledgerUrl, token, userId, timeout? });
```

| Method | Returns | Description |
|--------|---------|-------------|
| `submitAndWait(params)` | `{ updateId, completionOffset }` | Submit command synchronously |
| `submitAndWaitForTransaction(params)` | `TransactionResponse` | Submit and get full transaction |
| `queryActiveContracts(params)` | `ActiveContract[]` | Query ACS at offset |
| `getTransactionById(updateId)` | `TransactionTree \| null` | Fetch by update ID |
| `getLedgerEnd()` | `number` | Current ledger offset |
| `allocateParty(hint)` | `PartyDetails` | Allocate new party |
| `listParties()` | `PartyDetails[]` | List all parties |
| `isHealthy()` | `boolean` | Health check via /livez |

---

## USDCxService

USDCx token operations.

```typescript
import { USDCxService } from "@caypo/canton-sdk";
const usdcx = new USDCxService(client, partyId);
```

| Method | Returns | Description |
|--------|---------|-------------|
| `getHoldings()` | `USDCxHolding[]` | Query all Holding contracts |
| `getBalance()` | `string` | Sum of all holdings |
| `transfer({ recipient, amount, commandId? })` | `TransferResult` | 1-step transfer |
| `mergeHoldings(holdingCids)` | `string` | Merge UTXOs |

---

## CheckingAccount

```typescript
agent.checking.balance()    // { available: string, holdingCount: number }
agent.checking.send(recipient, amount, opts?)  // TransferResult
agent.checking.address()    // string (party ID)
agent.checking.history(opts?)  // TransactionRecord[]
```

## SavingsAccount

```typescript
agent.savings.deposit(amount)     // DepositResult
agent.savings.withdraw(amount)    // WithdrawResult
agent.savings.balance()           // YieldBalance
agent.savings.rebalance()         // { moved, from?, to?, apy? }
agent.savings.earnings()          // EarningsReport
agent.savings.positions()         // DeFiPosition[]
```

## CreditAccount

```typescript
agent.credit.borrow(amount)   // BorrowResult (checks health >= 1.5)
agent.credit.repay(amount)    // RepayResult
agent.credit.health()         // HealthMetrics
agent.credit.balance()        // DebtInfo
```

## ExchangeAccount

```typescript
agent.exchange.quote(amount, from, to)   // SwapQuote
agent.exchange.swap(amount, from, to, opts?)  // SwapResult
agent.exchange.pairs()   // TradingPair[]
agent.exchange.rates()   // ExchangeRate[]
```

## InvestmentAccount

```typescript
agent.invest.buy(amount, asset)           // { txId, received }
agent.invest.sell(amount, asset)          // { txId, received }
agent.invest.earn(asset)                  // { enabled, asset }
agent.invest.unearn(asset)               // { enabled, asset }
agent.invest.portfolio()                  // PortfolioSummary
agent.invest.strategyList()              // Strategy[]
agent.invest.strategyBuy(name, amount)   // [{ asset, amount }]
agent.invest.strategyCreate(name, allocations)  // Strategy
agent.invest.autoSetup(amount, frequency, strategy)  // AutoInvestConfig
agent.invest.autoRun()                   // [{ asset, amount }] | null
agent.invest.autoStatus()                // AutoInvestConfig | null
```

## SafeguardManager

```typescript
const mgr = await SafeguardManager.load(path?);
mgr.settings()              // SafeguardConfig
mgr.setTxLimit(amount)      // void
mgr.setDailyLimit(amount)   // void
mgr.lock(pin?)              // void
mgr.unlock(pin)             // void
mgr.check(amount)           // { allowed, reason?, dailyRemaining }
mgr.recordSpend(amount)     // void
mgr.resetDaily()            // void
```

## TrafficManager

```typescript
agent.traffic.trafficBalance()       // { totalPurchased, consumed, remaining }
agent.traffic.hasSufficientTraffic() // boolean
agent.traffic.purchaseTraffic(cc)    // { txId } (stub)
agent.traffic.setAutoPurchase(config) // void
```

## MppPayClient

```typescript
agent.mpp.pay(url, opts?)  // { response, paid, receipt? }
```

| Option | Type | Description |
|--------|------|-------------|
| `method` | `string` | HTTP method (default: GET) |
| `headers` | `Record<string, string>` | Custom headers |
| `body` | `string` | Request body |
| `maxPrice` | `string` | Maximum USDCx price |

## Keystore

```typescript
import { Keystore } from "@caypo/canton-sdk";

const ks = await Keystore.create(pin, { partyId, jwt, userId }, path?);
const loaded = await Keystore.load(pin, path?);

loaded.address              // Party ID
loaded.getCredentials()     // { partyId, jwt, userId }
loaded.changePin(old, new)  // void
loaded.exportKey(pin)       // hex string
```

## Amount Utilities

```typescript
import { addAmounts, subtractAmounts, compareAmounts, isValidAmount, toCantonAmount } from "@caypo/canton-sdk";

addAmounts("1.5", "2.5")        // "4"
subtractAmounts("10", "3")       // "7"
compareAmounts("10", "9.99")     // 1
isValidAmount("1.23")            // true
toCantonAmount("1.5")            // "1.5000000000"
```
