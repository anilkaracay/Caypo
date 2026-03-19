/**
 * @caypo/canton-sdk — Core SDK for Canton Network.
 * JSON Ledger API v2 client, USDCx operations, agent accounts.
 */

export { MPP_CANTON_VERSION } from "@caypo/mpp-canton";

export const CANTON_SDK_VERSION = "0.1.0";

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
