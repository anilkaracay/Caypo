/**
 * Canton JSON Ledger API v2 — Type Definitions
 *
 * Verified against: docs.digitalasset.com/build/3.5, Canton OpenAPI spec v3.3.0
 * Default port: 7575
 */

// ---------------------------------------------------------------------------
// Party
// ---------------------------------------------------------------------------

export interface PartyLocalMetadata {
  resourceVersion: string;
  annotations: Record<string, string>;
}

export interface PartyDetails {
  party: string; // e.g., "Alice::122084768362d0ce21f1ffec870e55e365a292cdf8f54c5c38ad7775b9bdd462e141"
  isLocal: boolean;
  localMetadata: PartyLocalMetadata;
  identityProviderId: string;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

export interface CreateCommand {
  CreateCommand: {
    templateId: string; // "#package-name:Module:Template" or "packagehash:Module:Template"
    createArguments: Record<string, unknown>;
  };
}

export interface ExerciseCommand {
  ExerciseCommand: {
    templateId: string;
    contractId: string;
    choice: string;
    choiceArgument: Record<string, unknown>;
  };
}

export type Command = CreateCommand | ExerciseCommand;

// ---------------------------------------------------------------------------
// Submit and Wait
// ---------------------------------------------------------------------------

export interface SubmitAndWaitRequest {
  commands: Command[];
  userId: string;
  commandId: string;
  actAs: string[];
  readAs?: string[];
}

export interface SubmitAndWaitResponse {
  updateId: string;
  completionOffset: number;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface CreatedEvent {
  contractId: string;
  templateId: string;
  createArgument: Record<string, unknown>;
  witnessParties: string[];
  signatories: string[];
  observers: string[];
}

export interface ArchivedEvent {
  contractId: string;
  templateId: string;
  witnessParties: string[];
}

export interface ExercisedEvent {
  contractId: string;
  templateId: string;
  choice: string;
  choiceArgument: Record<string, unknown>;
  exerciseResult: unknown;
  actingParties: string[];
  childEvents: TransactionTreeEvent[];
}

export type TransactionTreeEvent =
  | { createdEvent: CreatedEvent }
  | { exercisedEvent: ExercisedEvent };

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export interface TransactionTree {
  updateId: string;
  commandId: string;
  effectiveAt: string;
  offset: number;
  eventsById: Record<string, TransactionTreeEvent>;
  rootEventIds: string[];
}

export interface FlatTransaction {
  updateId: string;
  commandId: string;
  effectiveAt: string;
  offset: number;
  events: Array<{ createdEvent?: CreatedEvent; archivedEvent?: ArchivedEvent }>;
}

export interface TransactionResponse {
  transaction: FlatTransaction;
}

// ---------------------------------------------------------------------------
// Active Contracts
// ---------------------------------------------------------------------------

export interface IdentifierFilter {
  identifierFilter:
    | { TemplateFilter: { value: { templateId: string } } }
    | { WildcardFilter: { value: { includeCreatedEventBlob?: boolean } } };
}

export interface PartyFilter {
  cumulative: IdentifierFilter[];
}

export interface AnyPartyFilter {
  cumulative: IdentifierFilter[];
}

export interface EventFormat {
  filtersByParty?: Record<string, PartyFilter>;
  filtersForAnyParty?: AnyPartyFilter;
  verbose?: boolean;
}

export interface ActiveContractsRequest {
  eventFormat: EventFormat;
  activeAtOffset: number;
}

export interface ActiveContract {
  contractId: string;
  templateId: string;
  createArgument: Record<string, unknown>;
  createdAt: string;
  signatories: string[];
  observers: string[];
}

// ---------------------------------------------------------------------------
// Ledger State
// ---------------------------------------------------------------------------

export interface LedgerEndResponse {
  offset: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type CantonErrorCode =
  | "INVALID_ARGUMENT"
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "ALREADY_EXISTS"
  | "FAILED_PRECONDITION"
  | "UNAVAILABLE"
  | string;

export interface LedgerError {
  cause: string;
  code: CantonErrorCode;
  context: Record<string, string>;
  errorCategory: number;
  grpcCodeValue: number;
}

// ---------------------------------------------------------------------------
// Client Config
// ---------------------------------------------------------------------------

export interface CantonClientConfig {
  ledgerUrl: string; // e.g., "http://localhost:7575"
  token: string; // JWT bearer token
  userId: string; // Ledger API user ID
  timeout?: number; // Request timeout in ms (default: 30000)
}

// ---------------------------------------------------------------------------
// Client Method Params (excluding userId, which comes from config)
// ---------------------------------------------------------------------------

export interface SubmitParams {
  commands: Command[];
  commandId: string;
  actAs: string[];
  readAs?: string[];
}

export interface QueryActiveContractsParams {
  filtersByParty?: Record<string, PartyFilter>;
  filtersForAnyParty?: AnyPartyFilter;
  activeAtOffset: number;
}
