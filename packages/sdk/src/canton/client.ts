/**
 * Canton JSON Ledger API v2 — Client
 *
 * All requests target config.ledgerUrl + path.
 * All requests include Authorization: Bearer <token>.
 * Errors are parsed into typed CantonApiError / CantonAuthError / CantonTimeoutError.
 */

import { CantonApiError, CantonAuthError, CantonTimeoutError } from "./errors.js";
import type {
  ActiveContract,
  CantonClientConfig,
  CreatedEvent,
  LedgerError,
  PartyDetails,
  QueryActiveContractsParams,
  SubmitAndWaitResponse,
  SubmitParams,
  TransactionResponse,
  TransactionTree,
} from "./types.js";

const DEFAULT_TIMEOUT = 30_000;

export class CantonClient {
  private readonly ledgerUrl: string;
  private readonly token: string;
  private readonly userId: string;
  private readonly timeout: number;

  constructor(config: CantonClientConfig) {
    this.ledgerUrl = config.ledgerUrl.replace(/\/+$/, "");
    this.token = config.token;
    this.userId = config.userId;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  // ---------------------------------------------------------------------------
  // Command Submission
  // ---------------------------------------------------------------------------

  async submitAndWait(params: SubmitParams): Promise<SubmitAndWaitResponse> {
    return this.request<SubmitAndWaitResponse>("POST", "/v2/commands/submit-and-wait", {
      commands: params.commands,
      userId: this.userId,
      commandId: params.commandId,
      actAs: params.actAs,
      readAs: params.readAs,
    });
  }

  async submitAndWaitForTransaction(params: SubmitParams): Promise<TransactionResponse> {
    return this.request<TransactionResponse>(
      "POST",
      "/v2/commands/submit-and-wait-for-transaction",
      {
        commands: params.commands,
        userId: this.userId,
        commandId: params.commandId,
        actAs: params.actAs,
        readAs: params.readAs,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Active Contract Queries
  // ---------------------------------------------------------------------------

  async queryActiveContracts(params: QueryActiveContractsParams): Promise<ActiveContract[]> {
    const body = {
      eventFormat: {
        filtersByParty: params.filtersByParty,
        filtersForAnyParty: params.filtersForAnyParty,
        verbose: true,
      },
      activeAtOffset: params.activeAtOffset,
    };

    const response = await this.request<{
      contractEntry?: Array<{ createdEvent?: CreatedEvent }>;
    }>("POST", "/v2/state/active-contracts", body);

    if (!response.contractEntry) {
      return [];
    }

    return response.contractEntry
      .filter((entry) => entry.createdEvent != null)
      .map((entry) => {
        const evt = entry.createdEvent!;
        return {
          contractId: evt.contractId,
          templateId: evt.templateId,
          createArgument: evt.createArgument,
          createdAt: "",
          signatories: evt.signatories,
          observers: evt.observers,
        };
      });
  }

  // ---------------------------------------------------------------------------
  // Transaction Lookup
  // ---------------------------------------------------------------------------

  async getTransactionById(updateId: string): Promise<TransactionTree | null> {
    try {
      return await this.request<TransactionTree>(
        "GET",
        `/v2/updates/transaction-by-id/${encodeURIComponent(updateId)}`,
      );
    } catch (err) {
      if (err instanceof CantonApiError && err.code === "NOT_FOUND") {
        return null;
      }
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Ledger State
  // ---------------------------------------------------------------------------

  async getLedgerEnd(): Promise<number> {
    const response = await this.request<{ offset: number }>("GET", "/v2/state/ledger-end");
    return response.offset;
  }

  // ---------------------------------------------------------------------------
  // Party Management
  // ---------------------------------------------------------------------------

  async allocateParty(hint: string): Promise<PartyDetails> {
    const response = await this.request<{ partyDetails: PartyDetails }>("POST", "/v2/parties", {
      partyIdHint: hint,
      identityProviderId: "",
    });
    return response.partyDetails;
  }

  async listParties(): Promise<PartyDetails[]> {
    const response = await this.request<{ partyDetails: PartyDetails[] }>("GET", "/v2/parties");
    return response.partyDetails;
  }

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ledgerUrl}/livez`, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(this.timeout),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.ledgerUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.timeout),
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new CantonTimeoutError(path, this.timeout);
      }
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new CantonTimeoutError(path, this.timeout);
      }
      throw err;
    }

    if (response.status === 401 || response.status === 403) {
      const text = await response.text().catch(() => "");
      throw new CantonAuthError(response.status, text || undefined);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      if (errorBody && typeof errorBody === "object" && "code" in errorBody) {
        throw new CantonApiError(errorBody as LedgerError);
      }
      throw new Error(`Canton API error: HTTP ${response.status} on ${method} ${path}`);
    }

    // Some endpoints (like livez) may return empty body
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }
}
