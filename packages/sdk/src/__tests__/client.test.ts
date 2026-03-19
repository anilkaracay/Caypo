import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CantonClient } from "../canton/client.js";
import { CantonApiError, CantonAuthError, CantonTimeoutError } from "../canton/errors.js";
import type { Command, LedgerError } from "../canton/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:7575";
const TOKEN = "test-jwt-token";
const USER_ID = "ledger-api-user";
const PARTY = "Alice::122084768362d0ce21f1ffec870e55e365a292cdf8f54c5c38ad7775b9bdd462e141";

function makeClient(overrides?: { timeout?: number }) {
  return new CantonClient({
    ledgerUrl: BASE_URL,
    token: TOKEN,
    userId: USER_ID,
    timeout: overrides?.timeout,
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(error: LedgerError, status = 400): Response {
  return new Response(JSON.stringify(error), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const mockFetch = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Auth header inclusion
// ---------------------------------------------------------------------------

describe("auth header", () => {
  it("includes Bearer token on every request", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 42 }));

    await client.getLedgerEnd();

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect((init?.headers as Record<string, string>)["Authorization"]).toBe(`Bearer ${TOKEN}`);
  });
});

// ---------------------------------------------------------------------------
// submitAndWait
// ---------------------------------------------------------------------------

describe("submitAndWait", () => {
  const commands: Command[] = [
    {
      CreateCommand: {
        templateId: "#json-tests:Main:Asset",
        createArguments: { issuer: PARTY, owner: PARTY, name: "Asset" },
      },
    },
  ];

  it("sends correct request and returns updateId + completionOffset", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ updateId: "update-123", completionOffset: 20 }),
    );

    const result = await client.submitAndWait({
      commands,
      commandId: "cmd-1",
      actAs: [PARTY],
      readAs: [PARTY],
    });

    expect(result).toEqual({ updateId: "update-123", completionOffset: 20 });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/v2/commands/submit-and-wait`);
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json");

    const body = JSON.parse(init?.body as string);
    expect(body.userId).toBe(USER_ID);
    expect(body.commandId).toBe("cmd-1");
    expect(body.actAs).toEqual([PARTY]);
    expect(body.readAs).toEqual([PARTY]);
    expect(body.commands).toEqual(commands);
  });

  it("throws CantonApiError on ledger error response", async () => {
    const client = makeClient();
    const ledgerError: LedgerError = {
      cause: "Invalid template ID",
      code: "INVALID_ARGUMENT",
      context: { category: "8", participant: "participant1" },
      errorCategory: 8,
      grpcCodeValue: 3,
    };
    mockFetch.mockResolvedValueOnce(errorResponse(ledgerError));

    await expect(
      client.submitAndWait({ commands, commandId: "cmd-2", actAs: [PARTY] }),
    ).rejects.toThrow(CantonApiError);

    try {
      await client.submitAndWait({ commands, commandId: "cmd-2", actAs: [PARTY] });
    } catch (err) {
      // fetch was only mocked once, so we test the first rejection
    }
  });
});

// ---------------------------------------------------------------------------
// submitAndWaitForTransaction
// ---------------------------------------------------------------------------

describe("submitAndWaitForTransaction", () => {
  it("sends to correct endpoint and returns transaction", async () => {
    const client = makeClient();
    const txResponse = {
      transaction: {
        updateId: "tx-456",
        commandId: "cmd-3",
        effectiveAt: "2025-01-01T00:00:00Z",
        offset: 30,
        events: [{ createdEvent: { contractId: "cid-1", templateId: "pkg:M:T", createArgument: {} } }],
      },
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(txResponse));

    const result = await client.submitAndWaitForTransaction({
      commands: [
        {
          ExerciseCommand: {
            templateId: "pkg:Module:Template",
            contractId: "00572c50",
            choice: "ChoiceName",
            choiceArgument: { field: "value" },
          },
        },
      ],
      commandId: "cmd-3",
      actAs: [PARTY],
    });

    expect(result.transaction.updateId).toBe("tx-456");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/v2/commands/submit-and-wait-for-transaction`);
  });
});

// ---------------------------------------------------------------------------
// queryActiveContracts
// ---------------------------------------------------------------------------

describe("queryActiveContracts", () => {
  it("returns parsed active contracts", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        contractEntry: [
          {
            createdEvent: {
              contractId: "cid-100",
              templateId: "pkg:Token:Holding",
              createArgument: { amount: "5.000000" },
              witnessParties: [PARTY],
              signatories: [PARTY],
              observers: [],
            },
          },
          {
            createdEvent: {
              contractId: "cid-101",
              templateId: "pkg:Token:Holding",
              createArgument: { amount: "3.000000" },
              witnessParties: [PARTY],
              signatories: [PARTY],
              observers: [],
            },
          },
        ],
      }),
    );

    const contracts = await client.queryActiveContracts({
      filtersByParty: {
        [PARTY]: {
          cumulative: [
            {
              identifierFilter: {
                TemplateFilter: { value: { templateId: "pkg:Token:Holding" } },
              },
            },
          ],
        },
      },
      activeAtOffset: 20,
    });

    expect(contracts).toHaveLength(2);
    expect(contracts[0].contractId).toBe("cid-100");
    expect(contracts[1].createArgument).toEqual({ amount: "3.000000" });

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.activeAtOffset).toBe(20);
    expect(body.eventFormat.verbose).toBe(true);
  });

  it("returns empty array when no contractEntry", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(jsonResponse({}));

    const contracts = await client.queryActiveContracts({ activeAtOffset: 0 });
    expect(contracts).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getTransactionById
// ---------------------------------------------------------------------------

describe("getTransactionById", () => {
  it("returns transaction tree on success", async () => {
    const client = makeClient();
    const tree = {
      updateId: "upd-789",
      commandId: "cmd-4",
      effectiveAt: "2025-06-01T12:00:00Z",
      offset: 50,
      eventsById: {},
      rootEventIds: ["evt-1"],
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(tree));

    const result = await client.getTransactionById("upd-789");

    expect(result).toEqual(tree);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/v2/updates/transaction-by-id/upd-789`);
  });

  it("returns null when NOT_FOUND", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(
      errorResponse(
        {
          cause: "Transaction not found",
          code: "NOT_FOUND",
          context: {},
          errorCategory: 5,
          grpcCodeValue: 5,
        },
        404,
      ),
    );

    const result = await client.getTransactionById("nonexistent");
    expect(result).toBeNull();
  });

  it("URL-encodes the updateId", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ updateId: "id/with/slashes", commandId: "", effectiveAt: "", offset: 0, eventsById: {}, rootEventIds: [] }),
    );

    await client.getTransactionById("id/with/slashes");

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/v2/updates/transaction-by-id/id%2Fwith%2Fslashes`);
  });
});

// ---------------------------------------------------------------------------
// getLedgerEnd
// ---------------------------------------------------------------------------

describe("getLedgerEnd", () => {
  it("returns the offset number", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 42 }));

    const offset = await client.getLedgerEnd();
    expect(offset).toBe(42);

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/v2/state/ledger-end`);
    expect(init?.method).toBe("GET");
  });
});

// ---------------------------------------------------------------------------
// allocateParty
// ---------------------------------------------------------------------------

describe("allocateParty", () => {
  it("sends partyIdHint and returns PartyDetails", async () => {
    const client = makeClient();
    const partyDetails = {
      party: PARTY,
      isLocal: true,
      localMetadata: { resourceVersion: "0", annotations: {} },
      identityProviderId: "",
    };
    mockFetch.mockResolvedValueOnce(jsonResponse({ partyDetails }));

    const result = await client.allocateParty("Alice");

    expect(result).toEqual(partyDetails);

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.partyIdHint).toBe("Alice");
    expect(body.identityProviderId).toBe("");
  });
});

// ---------------------------------------------------------------------------
// listParties
// ---------------------------------------------------------------------------

describe("listParties", () => {
  it("returns array of PartyDetails", async () => {
    const client = makeClient();
    const parties = [
      {
        party: PARTY,
        isLocal: true,
        localMetadata: { resourceVersion: "0", annotations: {} },
        identityProviderId: "",
      },
    ];
    mockFetch.mockResolvedValueOnce(jsonResponse({ partyDetails: parties }));

    const result = await client.listParties();
    expect(result).toHaveLength(1);
    expect(result[0].party).toBe(PARTY);

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/v2/parties`);
    expect(init?.method).toBe("GET");
  });
});

// ---------------------------------------------------------------------------
// isHealthy
// ---------------------------------------------------------------------------

describe("isHealthy", () => {
  it("returns true when /livez responds 200", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(new Response("ok", { status: 200 }));

    expect(await client.isHealthy()).toBe(true);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/livez`);
  });

  it("returns false when /livez responds non-200", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(new Response("", { status: 503 }));

    expect(await client.isHealthy()).toBe(false);
  });

  it("returns false when fetch throws (network error)", async () => {
    const client = makeClient();
    mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    expect(await client.isHealthy()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("error handling", () => {
  it("throws CantonAuthError on 401", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));

    await expect(client.getLedgerEnd()).rejects.toThrow(CantonAuthError);
  });

  it("throws CantonAuthError on 403", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(new Response("Forbidden", { status: 403 }));

    await expect(client.getLedgerEnd()).rejects.toThrow(CantonAuthError);
  });

  it("CantonAuthError preserves status code", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(new Response("Forbidden", { status: 403 }));

    try {
      await client.getLedgerEnd();
    } catch (err) {
      expect(err).toBeInstanceOf(CantonAuthError);
      expect((err as CantonAuthError).statusCode).toBe(403);
    }
  });

  it("throws CantonApiError with full details on structured error", async () => {
    const client = makeClient();
    const ledgerError: LedgerError = {
      cause: "Contract already exists",
      code: "ALREADY_EXISTS",
      context: { category: "6" },
      errorCategory: 6,
      grpcCodeValue: 6,
    };
    mockFetch.mockResolvedValueOnce(errorResponse(ledgerError, 409));

    try {
      await client.getLedgerEnd();
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CantonApiError);
      const apiErr = err as CantonApiError;
      expect(apiErr.code).toBe("ALREADY_EXISTS");
      expect(apiErr.ledgerCause).toBe("Contract already exists");
      expect(apiErr.grpcCodeValue).toBe(6);
      expect(apiErr.errorCategory).toBe(6);
    }
  });

  it("throws generic Error on non-structured error response", async () => {
    const client = makeClient();
    mockFetch.mockResolvedValueOnce(new Response("Internal Server Error", { status: 500 }));

    await expect(client.getLedgerEnd()).rejects.toThrow("Canton API error: HTTP 500");
  });
});

// ---------------------------------------------------------------------------
// Timeout handling
// ---------------------------------------------------------------------------

describe("timeout handling", () => {
  it("throws CantonTimeoutError when request times out", async () => {
    const client = makeClient({ timeout: 100 });
    mockFetch.mockImplementationOnce(() => {
      const err = new DOMException("The operation was aborted.", "TimeoutError");
      return Promise.reject(err);
    });

    await expect(client.getLedgerEnd()).rejects.toThrow(CantonTimeoutError);
  });

  it("CantonTimeoutError includes path and timeout value", async () => {
    const client = makeClient({ timeout: 5000 });
    mockFetch.mockImplementationOnce(() => {
      return Promise.reject(new DOMException("Aborted", "TimeoutError"));
    });

    try {
      await client.getLedgerEnd();
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(CantonTimeoutError);
      const timeoutErr = err as CantonTimeoutError;
      expect(timeoutErr.path).toBe("/v2/state/ledger-end");
      expect(timeoutErr.timeoutMs).toBe(5000);
    }
  });

  it("treats AbortError as timeout", async () => {
    const client = makeClient({ timeout: 100 });
    mockFetch.mockImplementationOnce(() => {
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    });

    await expect(client.getLedgerEnd()).rejects.toThrow(CantonTimeoutError);
  });
});

// ---------------------------------------------------------------------------
// URL construction
// ---------------------------------------------------------------------------

describe("URL construction", () => {
  it("strips trailing slash from ledgerUrl", async () => {
    const client = new CantonClient({
      ledgerUrl: "http://localhost:7575/",
      token: TOKEN,
      userId: USER_ID,
    });
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 1 }));

    await client.getLedgerEnd();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:7575/v2/state/ledger-end");
  });
});
