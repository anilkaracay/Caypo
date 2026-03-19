import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cantonServer, MppVerificationError, type CantonMppServerConfig } from "../server.js";
import type { CantonCredentialPayload, CantonRequest } from "../schemas.js";
import type { CredentialData } from "mppx";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GATEWAY_PARTY = "Gateway::1220bbbb";
const AGENT_PARTY = "Agent::1220aaaa";

const serverConfig: CantonMppServerConfig = {
  ledgerUrl: "http://localhost:7575",
  token: "server-jwt",
  userId: "ledger-api-user",
  recipientPartyId: GATEWAY_PARTY,
  network: "testnet",
};

function makeCredential(
  overrides?: Partial<CantonCredentialPayload>,
  requestOverrides?: Partial<CantonRequest>,
): CredentialData<CantonCredentialPayload, CantonRequest> {
  return {
    challenge: {
      request: {
        amount: "1.50",
        currency: "USDCx",
        recipient: GATEWAY_PARTY,
        network: "testnet",
        expiry: 300,
        ...requestOverrides,
      },
    },
    payload: {
      updateId: "upd-123",
      completionOffset: 42,
      sender: AGENT_PARTY,
      commandId: "cmd-456",
      ...overrides,
    },
  };
}

function makeTransactionResponse(holdingAmount: string, recipientParty: string, senderParty: string) {
  return {
    updateId: "upd-123",
    eventsById: {
      "evt-1": {
        exercisedEvent: {
          contractId: "factory-cid",
          choice: "TransferFactory_Transfer",
          actingParties: [senderParty],
        },
      },
      "evt-2": {
        createdEvent: {
          contractId: "new-holding",
          templateId: "Splice.Api.Token.HoldingV1:Holding",
          createArgument: { amount: holdingAmount, owner: recipientParty },
          witnessParties: [recipientParty],
          signatories: [recipientParty],
          observers: [],
        },
      },
    },
    rootEventIds: ["evt-1"],
  };
}

const mockFetch = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// cantonServer — verify — success
// ---------------------------------------------------------------------------

describe("cantonServer.verify — success", () => {
  it("returns receipt on valid credential", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(makeTransactionResponse("1.50", GATEWAY_PARTY, AGENT_PARTY)),
    );

    const server = cantonServer(serverConfig);
    const receipt = await server.verify({ credential: makeCredential() });

    expect(receipt.method).toBe("canton");
    expect(receipt.reference).toBe("upd-123");
    expect(receipt.status).toBe("success");
    expect(receipt.timestamp).toBeTruthy();
  });

  it("accepts overpayment (amount > required)", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(makeTransactionResponse("5.00", GATEWAY_PARTY, AGENT_PARTY)),
    );

    const server = cantonServer(serverConfig);
    const receipt = await server.verify({ credential: makeCredential() });

    expect(receipt.status).toBe("success");
  });

  it("fetches transaction with correct URL and auth header", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(makeTransactionResponse("1.50", GATEWAY_PARTY, AGENT_PARTY)),
    );

    const server = cantonServer(serverConfig);
    await server.verify({ credential: makeCredential() });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:7575/v2/updates/transaction-by-id/upd-123");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer server-jwt");
  });
});

// ---------------------------------------------------------------------------
// cantonServer — verify — error cases
// ---------------------------------------------------------------------------

describe("cantonServer.verify — network mismatch", () => {
  it("throws MppVerificationError on wrong network", async () => {
    const server = cantonServer(serverConfig);

    try {
      await server.verify({
        credential: makeCredential({}, { network: "mainnet" }),
      });
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MppVerificationError);
      expect((err as MppVerificationError).problemCode).toBe("verification-failed");
      expect((err as MppVerificationError).message).toContain("Network mismatch");
    }
  });
});

describe("cantonServer.verify — recipient mismatch", () => {
  it("throws MppVerificationError on wrong recipient", async () => {
    const server = cantonServer(serverConfig);

    try {
      await server.verify({
        credential: makeCredential({}, { recipient: "Other::1220cccc" }),
      });
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MppVerificationError);
      expect((err as MppVerificationError).problemCode).toBe("verification-failed");
      expect((err as MppVerificationError).message).toContain("Recipient mismatch");
    }
  });
});

describe("cantonServer.verify — transaction not found", () => {
  it("throws when ledger returns 404", async () => {
    mockFetch.mockResolvedValueOnce(new Response("Not found", { status: 404 }));

    const server = cantonServer(serverConfig);

    try {
      await server.verify({ credential: makeCredential() });
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MppVerificationError);
      expect((err as MppVerificationError).problemCode).toBe("verification-failed");
      expect((err as MppVerificationError).message).toContain("Transaction not found");
    }
  });
});

describe("cantonServer.verify — insufficient amount", () => {
  it("throws when received less than required", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(makeTransactionResponse("0.50", GATEWAY_PARTY, AGENT_PARTY)),
    );

    const server = cantonServer(serverConfig);

    try {
      await server.verify({ credential: makeCredential() });
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MppVerificationError);
      expect((err as MppVerificationError).problemCode).toBe("payment-insufficient");
      expect((err as MppVerificationError).message).toContain("Payment insufficient");
    }
  });
});

describe("cantonServer.verify — no holding for recipient", () => {
  it("throws when no created Holding event for gateway party", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        updateId: "upd-123",
        eventsById: {
          "evt-1": {
            exercisedEvent: {
              contractId: "factory-cid",
              choice: "TransferFactory_Transfer",
              actingParties: [AGENT_PARTY],
            },
          },
          // Holding created for wrong party
          "evt-2": {
            createdEvent: {
              contractId: "new-holding",
              templateId: "Splice.Api.Token.HoldingV1:Holding",
              createArgument: { amount: "1.50", owner: "Other::1220dddd" },
              witnessParties: ["Other::1220dddd"],
              signatories: ["Other::1220dddd"],
              observers: [],
            },
          },
        },
        rootEventIds: ["evt-1"],
      }),
    );

    const server = cantonServer(serverConfig);

    try {
      await server.verify({ credential: makeCredential() });
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MppVerificationError);
      expect((err as MppVerificationError).message).toContain("No holding created for recipient");
    }
  });
});

describe("cantonServer.verify — sender mismatch", () => {
  it("throws when sender did not exercise the transfer", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        updateId: "upd-123",
        eventsById: {
          // Different party exercised
          "evt-1": {
            exercisedEvent: {
              contractId: "factory-cid",
              choice: "TransferFactory_Transfer",
              actingParties: ["Intruder::1220eeee"],
            },
          },
          "evt-2": {
            createdEvent: {
              contractId: "new-holding",
              templateId: "Splice.Api.Token.HoldingV1:Holding",
              createArgument: { amount: "1.50", owner: GATEWAY_PARTY },
              witnessParties: [GATEWAY_PARTY],
              signatories: [GATEWAY_PARTY],
              observers: [],
            },
          },
        },
        rootEventIds: ["evt-1"],
      }),
    );

    const server = cantonServer(serverConfig);

    try {
      await server.verify({ credential: makeCredential() });
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MppVerificationError);
      expect((err as MppVerificationError).problemCode).toBe("verification-failed");
      expect((err as MppVerificationError).message).toContain("Sender mismatch");
    }
  });
});

// ---------------------------------------------------------------------------
// Round-trip test
// ---------------------------------------------------------------------------

describe("round-trip: client credential → server verify", () => {
  it("full flow succeeds", async () => {
    // --- Client side: 3 fetch calls ---
    // 1. getLedgerEnd
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 100 }));
    // 2. queryActiveContracts
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        contractEntry: [
          {
            createdEvent: {
              contractId: "hold-rt",
              templateId: "Splice.Api.Token.HoldingV1:Holding",
              createArgument: { amount: "10.000000", owner: AGENT_PARTY },
              witnessParties: [AGENT_PARTY],
              signatories: [AGENT_PARTY],
              observers: [],
            },
          },
        ],
      }),
    );
    // 3. submitAndWait
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ updateId: "upd-roundtrip", completionOffset: 101 }),
    );

    // Create credential via client
    const { cantonClient: makeClient } = await import("../client.js");
    const client = makeClient({
      ledgerUrl: "http://localhost:7575",
      token: "agent-jwt",
      userId: "ledger-api-user",
      partyId: AGENT_PARTY,
      network: "testnet",
    });

    const credentialStr = await client.createCredential({
      challenge: {
        request: {
          amount: "2.00",
          currency: "USDCx" as const,
          recipient: GATEWAY_PARTY,
          network: "testnet" as const,
          expiry: 300,
        },
      },
    });

    // --- Server side: 1 fetch call ---
    // Deserialize to get the payload
    const { Credential } = await import("mppx");
    const decoded = Credential.deserialize<CantonCredentialPayload, CantonRequest>(credentialStr);

    // Mock the transaction fetch for server verification
    mockFetch.mockResolvedValueOnce(
      jsonResponse(makeTransactionResponse("2.00", GATEWAY_PARTY, AGENT_PARTY)),
    );

    const { cantonServer: makeServer } = await import("../server.js");
    const server = makeServer(serverConfig);
    const receipt = await server.verify({ credential: decoded });

    expect(receipt.method).toBe("canton");
    expect(receipt.reference).toBe("upd-roundtrip");
    expect(receipt.status).toBe("success");
  });
});
