/**
 * Canton sandbox E2E test setup.
 *
 * Connects to a local Canton sandbox (http://localhost:7575) or a remote
 * node via CANTON_LEDGER_URL. Skips all E2E tests if no node is reachable.
 */

import { CantonClient } from "../../canton/client.js";

export interface CantonConnection {
  ledgerUrl: string;
  isAvailable: boolean;
}

/**
 * Check if a Canton node is reachable.
 */
export async function getCantonConnection(): Promise<CantonConnection> {
  const url = process.env.CANTON_LEDGER_URL ?? "http://localhost:7575";
  try {
    const res = await fetch(`${url}/livez`, { signal: AbortSignal.timeout(3000) });
    return { ledgerUrl: url, isAvailable: res.ok };
  } catch {
    return { ledgerUrl: url, isAvailable: false };
  }
}

/**
 * Create a CantonClient for E2E tests.
 */
export function createTestClient(ledgerUrl: string): CantonClient {
  return new CantonClient({
    ledgerUrl,
    token: process.env.CANTON_JWT ?? "",
    userId: process.env.CANTON_USER_ID ?? "ledger-api-user",
    timeout: 15_000,
  });
}

/**
 * Create a test party with a unique name to avoid collisions.
 */
export async function createTestParty(
  client: CantonClient,
  prefix: string,
): Promise<string> {
  const hint = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const details = await client.allocateParty(hint);
  return details.party;
}
