import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Credential } from "mppx";
import { cantonClient, type CantonMppClientConfig } from "../client.js";
import type { CantonCredentialPayload, CantonRequest } from "../schemas.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AGENT_PARTY = "Agent::1220aaaa";
const GATEWAY_PARTY = "Gateway::1220bbbb";

const clientConfig: CantonMppClientConfig = {
  ledgerUrl: "http://localhost:7575",
  token: "test-jwt",
  userId: "ledger-api-user",
  partyId: AGENT_PARTY,
  network: "testnet",
};

function makeChallenge(overrides?: Partial<CantonRequest>) {
  return {
    request: {
      amount: "1.50",
      currency: "USDCx" as const,
      recipient: GATEWAY_PARTY,
      network: "testnet" as const,
      expiry: 300,
      ...overrides,
    },
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
// cantonClient — createCredential
// ---------------------------------------------------------------------------

describe("cantonClient.createCredential", () => {
  it("completes full flow: ledger-end → holdings → submit → credential", async () => {
    // 1. getLedgerEnd
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 50 }));
    // 2. queryActiveContracts (holdings)
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        contractEntry: [
          {
            createdEvent: {
              contractId: "hold-1",
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
      jsonResponse({ updateId: "upd-abc", completionOffset: 51 }),
    );

    const client = cantonClient(clientConfig);
    const credentialStr = await client.createCredential({
      challenge: makeChallenge(),
    });

    expect(typeof credentialStr).toBe("string");

    // Decode and verify
    const decoded = Credential.deserialize<CantonCredentialPayload, CantonRequest>(credentialStr);
    expect(decoded.payload.updateId).toBe("upd-abc");
    expect(decoded.payload.completionOffset).toBe(51);
    expect(decoded.payload.sender).toBe(AGENT_PARTY);
    expect(decoded.payload.commandId).toMatch(/^[0-9a-f]{8}-/);
    expect(decoded.challenge.request.amount).toBe("1.50");

    // Verify 3 fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Verify submit command includes TransferFactory_Transfer
    const submitCall = mockFetch.mock.calls[2];
    const submitBody = JSON.parse(submitCall[1]?.body as string);
    const cmd = submitBody.commands[0].ExerciseCommand;
    expect(cmd.choice).toBe("TransferFactory_Transfer");
    expect(cmd.choiceArgument.sender).toBe(AGENT_PARTY);
    expect(cmd.choiceArgument.receiver).toBe(GATEWAY_PARTY);
    expect(cmd.choiceArgument.amount).toBe("1.50");
    expect(cmd.choiceArgument.inputHoldingCids).toEqual(["hold-1"]);
  });

  it("throws on network mismatch", async () => {
    const client = cantonClient(clientConfig);

    await expect(
      client.createCredential({
        challenge: makeChallenge({ network: "mainnet" }),
      }),
    ).rejects.toThrow("Network mismatch");
  });

  it("throws on insufficient balance (no holdings)", async () => {
    // getLedgerEnd
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 10 }));
    // empty holdings
    mockFetch.mockResolvedValueOnce(jsonResponse({ contractEntry: [] }));

    const client = cantonClient(clientConfig);

    await expect(
      client.createCredential({ challenge: makeChallenge() }),
    ).rejects.toThrow("Insufficient balance");
  });

  it("throws on insufficient balance (holdings too small)", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 10 }));
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        contractEntry: [
          {
            createdEvent: {
              contractId: "hold-small",
              templateId: "t",
              createArgument: { amount: "0.50" },
              witnessParties: [AGENT_PARTY],
              signatories: [AGENT_PARTY],
              observers: [],
            },
          },
        ],
      }),
    );

    const client = cantonClient(clientConfig);

    await expect(
      client.createCredential({ challenge: makeChallenge({ amount: "100.00" }) }),
    ).rejects.toThrow("Insufficient balance");
  });

  it("throws when ledger API returns error", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("Internal error", { status: 500 }),
    );

    const client = cantonClient(clientConfig);

    await expect(
      client.createCredential({ challenge: makeChallenge() }),
    ).rejects.toThrow("Canton API error: HTTP 500");
  });

  it("selects multiple holdings when needed", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ offset: 20 }));
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        contractEntry: [
          {
            createdEvent: {
              contractId: "h-a",
              templateId: "t",
              createArgument: { amount: "3.0" },
              witnessParties: [AGENT_PARTY],
              signatories: [AGENT_PARTY],
              observers: [],
            },
          },
          {
            createdEvent: {
              contractId: "h-b",
              templateId: "t",
              createArgument: { amount: "4.0" },
              witnessParties: [AGENT_PARTY],
              signatories: [AGENT_PARTY],
              observers: [],
            },
          },
        ],
      }),
    );
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ updateId: "upd-multi", completionOffset: 21 }),
    );

    const client = cantonClient(clientConfig);
    const credentialStr = await client.createCredential({
      challenge: makeChallenge({ amount: "6.0" }),
    });

    const decoded = Credential.deserialize<CantonCredentialPayload>(credentialStr);
    expect(decoded.payload.updateId).toBe("upd-multi");

    // Verify multiple inputHoldingCids
    const submitBody = JSON.parse(mockFetch.mock.calls[2][1]?.body as string);
    const cids = submitBody.commands[0].ExerciseCommand.choiceArgument.inputHoldingCids;
    expect(cids.length).toBeGreaterThanOrEqual(2);
  });
});
