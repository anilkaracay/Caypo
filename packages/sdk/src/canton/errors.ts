/**
 * Canton SDK — Custom Error Classes
 */

import type { CantonErrorCode, LedgerError } from "./types.js";

export class CantonApiError extends Error {
  readonly code: CantonErrorCode;
  readonly ledgerCause: string;
  readonly grpcCodeValue: number;
  readonly errorCategory: number;
  readonly context: Record<string, string>;

  constructor(ledgerError: LedgerError) {
    super(`Canton API error [${ledgerError.code}]: ${ledgerError.cause}`);
    this.name = "CantonApiError";
    this.code = ledgerError.code;
    this.ledgerCause = ledgerError.cause;
    this.grpcCodeValue = ledgerError.grpcCodeValue;
    this.errorCategory = ledgerError.errorCategory;
    this.context = ledgerError.context;
  }
}

export class CantonTimeoutError extends Error {
  readonly timeoutMs: number;
  readonly path: string;

  constructor(path: string, timeoutMs: number) {
    super(`Canton request to ${path} timed out after ${timeoutMs}ms`);
    this.name = "CantonTimeoutError";
    this.timeoutMs = timeoutMs;
    this.path = path;
  }
}

export class CantonAuthError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message?: string) {
    super(message ?? `Canton authentication failed (HTTP ${statusCode})`);
    this.name = "CantonAuthError";
    this.statusCode = statusCode;
  }
}
