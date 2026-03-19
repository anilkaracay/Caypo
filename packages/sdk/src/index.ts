/**
 * @caypo/canton-sdk — Core SDK for Canton Network.
 * JSON Ledger API v2 client, USDCx operations, agent accounts.
 */

export { MPP_CANTON_VERSION } from "@caypo/mpp-canton";

export const CANTON_SDK_VERSION = "0.2.0";

export const DEFAULT_LEDGER_PORT = 7575;

// Canton JSON Ledger API v2 client
export { CantonClient } from "./canton/client.js";
export { CantonApiError, CantonAuthError, CantonTimeoutError } from "./canton/errors.js";
export type {
  ActiveContract,
  ActiveContractsRequest,
  AnyPartyFilter,
  ArchivedEvent,
  CantonClientConfig,
  CantonErrorCode,
  Command,
  CreateCommand,
  CreatedEvent,
  EventFormat,
  ExerciseCommand,
  ExercisedEvent,
  FlatTransaction,
  IdentifierFilter,
  LedgerEndResponse,
  LedgerError,
  PartyDetails,
  PartyFilter,
  PartyLocalMetadata,
  QueryActiveContractsParams,
  SubmitAndWaitRequest,
  SubmitAndWaitResponse,
  SubmitParams,
  TransactionResponse,
  TransactionTree,
  TransactionTreeEvent,
} from "./canton/types.js";

// USDCx operations
export {
  USDCxService,
  USDCX_HOLDING_TEMPLATE_ID,
  USDCX_INSTRUMENT_ID,
  TRANSFER_FACTORY_TEMPLATE_ID,
} from "./canton/usdcx.js";
export type { TransferParams, TransferResult } from "./canton/usdcx.js";

// Amount utilities (string-based decimal arithmetic)
export {
  addAmounts,
  compareAmounts,
  isValidAmount,
  subtractAmounts,
  toCantonAmount,
} from "./canton/amount.js";

// Holding selection
export { InsufficientBalanceError, selectHoldings } from "./canton/holdings.js";
export type { HoldingSelection, USDCxHolding } from "./canton/holdings.js";

// Wallet keystore
export { Keystore } from "./wallet/keystore.js";
export type { WalletData } from "./wallet/keystore.js";

// Agent configuration
export { loadConfig, saveConfig, DEFAULT_CONFIG } from "./wallet/config.js";
export type {
  AgentConfig,
  TrafficConfig,
  SafeguardsConfig,
  MppConfig,
} from "./wallet/config.js";

// Safeguards
export { SafeguardManager } from "./safeguards/manager.js";
export type { SafeguardConfig, CheckResult } from "./safeguards/manager.js";

// High-level agent
export { CantonAgent } from "./agent.js";
export type { CantonAgentConfig, WalletInfo } from "./agent.js";

// Checking account
export { CheckingAccount } from "./accounts/checking.js";
export type { SendOptions, TransactionRecord } from "./accounts/checking.js";

// Traffic manager
export { TrafficManager } from "./traffic/manager.js";
export type { TrafficBalance, AutoPurchaseConfig } from "./traffic/manager.js";

// MPP pay client
export { MppPayClient, parseWwwAuthenticate } from "./mpp/pay-client.js";
export type { PayOptions, PayResult, PaymentChallenge } from "./mpp/pay-client.js";

// Savings account
export { SavingsAccount } from "./accounts/savings.js";
export type { DeFiPosition, EarningsReport } from "./accounts/savings.js";

// Credit account
export { CreditAccount } from "./accounts/credit.js";

// Exchange account
export { ExchangeAccount } from "./accounts/exchange.js";
export type { SwapOptions } from "./accounts/exchange.js";

// Investment account
export { InvestmentAccount, CANTON_ASSETS, STRATEGIES } from "./accounts/investment.js";
export type { Position, PortfolioSummary, Strategy, Allocation, AutoInvestConfig } from "./accounts/investment.js";

// Protocol adapters
export { MockYieldProtocol } from "./protocols/yield.js";
export type { YieldProtocol, YieldBalance, DepositResult, WithdrawResult } from "./protocols/yield.js";
export { MockLendingProtocol } from "./protocols/lending.js";
export type { LendingProtocol, HealthMetrics, DebtInfo, BorrowResult, RepayResult } from "./protocols/lending.js";
export { MockDexProtocol } from "./protocols/dex.js";
export type { DexProtocol, SwapQuote, SwapResult, TradingPair, ExchangeRate } from "./protocols/dex.js";
