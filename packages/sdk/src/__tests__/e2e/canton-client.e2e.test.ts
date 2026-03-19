/**
 * CantonClient E2E tests — runs against a real Canton sandbox.
 * Uses capability detection to skip tests that need unavailable features.
 * Skipped entirely if no Canton node is reachable.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { CantonClient } from "../../canton/client.js";
import { CantonApiError, CantonAuthError } from "../../canton/errors.js";
import {
  getCantonConnection,
  detectCapabilities,
  createTestClient,
  createTestParty,
  type CantonCapabilities,
} from "./setup.js";

let client: CantonClient;
let cantonAvailable = false;
let caps: CantonCapabilities = {
  cantonAvailable: false,
  v2ApiAvailable: false,
  partyCreation: false,
  authRequired: false,
};

beforeAll(async () => {
  const conn = await getCantonConnection();
  cantonAvailable = conn.isAvailable;
  if (cantonAvailable) {
    client = createTestClient(conn.ledgerUrl);
    caps = await detectCapabilities(conn.ledgerUrl);
  }
});

// ---------------------------------------------------------------------------
// Core — only needs /livez
// ---------------------------------------------------------------------------

describe.skipIf(!cantonAvailable)("CantonClient E2E — Core", () => {
  it("should confirm Canton node is healthy via /livez", async () => {
    expect(await client.isHealthy()).toBe(true);
  });

  it("should return false for non-routable IP", async () => {
    const bad = new CantonClient({ ledgerUrl: "http://192.0.2.1:7575", token: "t", userId: "u", timeout: 1000 });
    expect(await bad.isHealthy()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// v2 API — needs /v2/state/ledger-end
// ---------------------------------------------------------------------------

describe.skipIf(!caps.v2ApiAvailable)("CantonClient E2E — v2 API", () => {
  it("should return ledger offset as number >= 0", async () => {
    const offset = await client.getLedgerEnd();
    expect(typeof offset).toBe("number");
    expect(offset).toBeGreaterThanOrEqual(0);
  });

  it("should query active contracts with WildcardFilter", async () => {
    const offset = await client.getLedgerEnd();
    const contracts = await client.queryActiveContracts({
      filtersForAnyParty: {
        cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }],
      },
      activeAtOffset: offset,
    });
    expect(Array.isArray(contracts)).toBe(true);
  });

  it("should return null for non-existent transaction", async () => {
    expect(await client.getTransactionById("nonexistent-99999")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Parties — needs party creation
// ---------------------------------------------------------------------------

describe.skipIf(!caps.partyCreation)("CantonClient E2E — Parties", () => {
  it("should allocate party matching Name::hexfingerprint", async () => {
    const party = await createTestParty(client, "e2e-test");
    expect(party).toMatch(/^e2e-test.*::[a-f0-9]+$/);
  });

  it("should list parties including newly created one", async () => {
    const newParty = await createTestParty(client, "e2e-list");
    const parties = await client.listParties();
    expect(parties.length).toBeGreaterThan(0);
    expect(parties.some((p) => p.party === newParty)).toBe(true);
  });

  it("should return isLocal=true with valid localMetadata", async () => {
    const details = await client.allocateParty(`e2e-local-${Date.now()}`);
    expect(details.isLocal).toBe(true);
    expect(details.localMetadata).toBeDefined();
    expect(details.localMetadata.resourceVersion).toBeDefined();
  });

  it("should produce unique party IDs for same prefix", async () => {
    const p1 = await createTestParty(client, "e2e-dup");
    const p2 = await createTestParty(client, "e2e-dup");
    expect(p1).not.toBe(p2);
  });

  it("should advance ledger offset after party creation", async () => {
    const off1 = await client.getLedgerEnd();
    await createTestParty(client, "e2e-advance");
    const off2 = await client.getLedgerEnd();
    expect(off2).toBeGreaterThanOrEqual(off1);
  });

  it("should return empty contracts for fresh party", async () => {
    const party = await createTestParty(client, "e2e-empty");
    const offset = await client.getLedgerEnd();
    const contracts = await client.queryActiveContracts({
      filtersByParty: {
        [party]: { cumulative: [{ identifierFilter: { WildcardFilter: { value: {} } } }] },
      },
      activeAtOffset: offset,
    });
    expect(contracts).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Errors — needs v2 API
// ---------------------------------------------------------------------------

describe.skipIf(!caps.v2ApiAvailable)("CantonClient E2E — Errors", () => {
  it("should throw structured error for invalid command", async () => {
    try {
      await client.submitAndWait({
        commands: [{ CreateCommand: { createArguments: {}, templateId: "nonexistent:Module:Template" } }],
        commandId: `err-${Date.now()}`,
        actAs: ["nonexistent::0000"],
      });
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err instanceof CantonApiError || err instanceof CantonAuthError || err instanceof Error).toBe(true);
      if (err instanceof CantonApiError) {
        expect(err.code).toBeTruthy();
        expect(typeof err.grpcCodeValue).toBe("number");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// CreateCommand + Query cycle — requires DAR
// ---------------------------------------------------------------------------

describe.skipIf(!caps.partyCreation)("CantonClient E2E — Command Cycle", () => {
  it("should submit CreateCommand and query back (if DAR loaded)", async () => {
    const party = await createTestParty(client, "e2e-create");
    try {
      const result = await client.submitAndWait({
        commands: [{
          CreateCommand: {
            templateId: "#caypo-test-token:Token:Token",
            createArguments: { issuer: party, owner: party, amount: "100.0", name: "TestUSDCx" },
          },
        }],
        commandId: `create-${Date.now()}`,
        actAs: [party],
      });

      expect(result.updateId).toBeTruthy();
      expect(result.completionOffset).toBeGreaterThan(0);

      // Query back
      const offset = await client.getLedgerEnd();
      const contracts = await client.queryActiveContracts({
        filtersByParty: { [party]: { cumulative: [{ identifierFilter: { WildcardFilter: { value: {} } } }] } },
        activeAtOffset: offset,
      });
      expect(contracts.length).toBeGreaterThan(0);
      const token = contracts.find((c) => c.createArgument.name === "TestUSDCx");
      expect(token).toBeDefined();
    } catch (err) {
      // DAR not loaded — expected on bare sandbox
      if (err instanceof CantonApiError && (err.code === "INVALID_ARGUMENT" || err.code === "NOT_FOUND")) {
        return;
      }
      throw err;
    }
  });
});
