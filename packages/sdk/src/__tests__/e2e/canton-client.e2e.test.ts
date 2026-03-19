/**
 * CantonClient E2E tests — runs against a real Canton sandbox.
 * Skipped automatically if no Canton node is reachable.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { CantonClient } from "../../canton/client.js";
import { CantonApiError } from "../../canton/errors.js";
import { getCantonConnection, createTestClient, createTestParty } from "./setup.js";

let client: CantonClient;
let cantonAvailable = false;
let ledgerUrl = "";

beforeAll(async () => {
  const conn = await getCantonConnection();
  cantonAvailable = conn.isAvailable;
  ledgerUrl = conn.ledgerUrl;
  if (cantonAvailable) {
    client = createTestClient(ledgerUrl);
  }
});

describe.skipIf(!cantonAvailable)("CantonClient E2E", () => {
  // -------------------------------------------------------------------------
  // Health
  // -------------------------------------------------------------------------

  it("should confirm Canton node is healthy", async () => {
    const healthy = await client.isHealthy();
    expect(healthy).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Ledger state
  // -------------------------------------------------------------------------

  it("should return current ledger offset (>= 0)", async () => {
    const offset = await client.getLedgerEnd();
    expect(typeof offset).toBe("number");
    expect(offset).toBeGreaterThanOrEqual(0);
  });

  // -------------------------------------------------------------------------
  // Party management
  // -------------------------------------------------------------------------

  it("should allocate a new party with correct format", async () => {
    const party = await createTestParty(client, "e2e-test");
    // Format: DisplayName::hexfingerprint
    expect(party).toMatch(/::[a-f0-9]+$/);
    expect(party).toContain("e2e-test");
  });

  it("should list parties including newly created one", async () => {
    const newParty = await createTestParty(client, "e2e-list");
    const parties = await client.listParties();

    expect(parties.length).toBeGreaterThan(0);
    expect(parties[0].party).toMatch(/::[a-f0-9]+$/);

    const found = parties.some((p) => p.party === newParty);
    expect(found).toBe(true);
  });

  it("should return isLocal=true for locally allocated party", async () => {
    const hint = `e2e-local-${Date.now()}`;
    const details = await client.allocateParty(hint);

    expect(details.isLocal).toBe(true);
    expect(details.identityProviderId).toBe("");
    expect(details.localMetadata).toBeDefined();
    expect(details.localMetadata.resourceVersion).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Active contracts
  // -------------------------------------------------------------------------

  it("should query active contracts at current offset", async () => {
    const offset = await client.getLedgerEnd();
    const contracts = await client.queryActiveContracts({
      filtersForAnyParty: {
        cumulative: [
          {
            identifierFilter: {
              WildcardFilter: { value: { includeCreatedEventBlob: false } },
            },
          },
        ],
      },
      activeAtOffset: offset,
    });

    expect(Array.isArray(contracts)).toBe(true);
    // May be empty on fresh sandbox — that's OK
  });

  // -------------------------------------------------------------------------
  // Transaction lookup
  // -------------------------------------------------------------------------

  it("should return null for non-existent transaction", async () => {
    const result = await client.getTransactionById("nonexistent-update-id-12345");
    expect(result).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it("should return structured error for invalid command", async () => {
    try {
      await client.submitAndWait({
        commands: [
          {
            CreateCommand: {
              createArguments: {},
              templateId: "nonexistent:Module:Template",
            },
          },
        ],
        commandId: `error-test-${Date.now()}`,
        actAs: ["nonexistent::0000"],
      });
      expect.fail("Should have thrown");
    } catch (err) {
      // Should be a structured Canton error (CantonApiError or CantonAuthError)
      expect(err).toBeDefined();
      if (err instanceof CantonApiError) {
        expect(err.code).toBeTruthy();
        expect(err.ledgerCause).toBeTruthy();
      }
      // Some Canton setups may return 401 for invalid parties — that's also valid
    }
  });

  // -------------------------------------------------------------------------
  // Timeout
  // -------------------------------------------------------------------------

  it("should return false for health check on unreachable endpoint", async () => {
    const badClient = new CantonClient({
      ledgerUrl: "http://192.0.2.1:7575", // RFC 5737 non-routable
      token: "test",
      userId: "test",
      timeout: 1000,
    });
    const healthy = await badClient.isHealthy();
    expect(healthy).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Ledger end increases over time
  // -------------------------------------------------------------------------

  it("should have non-decreasing ledger offset", async () => {
    const offset1 = await client.getLedgerEnd();
    // Allocate a party to advance the ledger
    await createTestParty(client, "e2e-advance");
    const offset2 = await client.getLedgerEnd();

    expect(offset2).toBeGreaterThanOrEqual(offset1);
  });
});
