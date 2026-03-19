import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MppPayClient, parseWwwAuthenticate } from "../mpp/pay-client.js";
import type { USDCxService } from "../canton/usdcx.js";
import { SafeguardManager } from "../safeguards/manager.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AGENT_PARTY = "Agent::1220aaaa";
const GATEWAY_PARTY = "Gateway::1220bbbb";

const mockFetch = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockUsdcx(): USDCxService {
  return {
    getHoldings: vi.fn().mockResolvedValue([]),
    getBalance: vi.fn().mockResolvedValue("100"),
    transfer: vi.fn().mockResolvedValue({
      updateId: "upd-pay",
      completionOffset: 50,
      commandId: "cmd-pay",
    }),
    mergeHoldings: vi.fn(),
  } as unknown as USDCxService;
}

function make402Response(amount: string): Response {
  return new Response("Payment Required", {
    status: 402,
    headers: {
      "WWW-Authenticate": `Payment method="canton", amount="${amount}", currency="USDCx", recipient="${GATEWAY_PARTY}", network="testnet"`,
    },
  });
}

// ---------------------------------------------------------------------------
// parseWwwAuthenticate
// ---------------------------------------------------------------------------

describe("parseWwwAuthenticate", () => {
  it("parses valid Canton payment challenge", () => {
    const result = parseWwwAuthenticate(
      `Payment method="canton", amount="0.01", currency="USDCx", recipient="${GATEWAY_PARTY}", network="mainnet"`,
    );

    expect(result).toEqual({
      amount: "0.01",
      currency: "USDCx",
      recipient: GATEWAY_PARTY,
      network: "mainnet",
    });
  });

  it("parses challenge with description", () => {
    const result = parseWwwAuthenticate(
      `Payment method="canton", amount="0.50", currency="USDCx", recipient="Gw::1220", network="testnet", description="API call"`,
    );

    expect(result?.description).toBe("API call");
  });

  it("defaults currency to USDCx if missing", () => {
    const result = parseWwwAuthenticate(
      `Payment method="canton", amount="1.0", recipient="R::1220", network="testnet"`,
    );

    expect(result?.currency).toBe("USDCx");
  });

  it("returns null for non-Payment header", () => {
    expect(parseWwwAuthenticate("Bearer realm=\"api\"")).toBeNull();
  });

  it("returns null for wrong method", () => {
    expect(
      parseWwwAuthenticate(`Payment method="stripe", amount="1.0", recipient="x", network="y"`),
    ).toBeNull();
  });

  it("returns null for missing required fields", () => {
    expect(parseWwwAuthenticate(`Payment method="canton"`)).toBeNull();
    expect(parseWwwAuthenticate(`Payment method="canton", amount="1.0"`)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// MppPayClient.pay — non-402 response
// ---------------------------------------------------------------------------

describe("MppPayClient.pay — non-402", () => {
  it("returns response as-is with paid=false", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: "ok" }), { status: 200 }),
    );

    const safeguards = new SafeguardManager();
    const client = new MppPayClient(mockUsdcx(), safeguards, AGENT_PARTY, "testnet");

    const result = await client.pay("https://api.example.com/data");

    expect(result.paid).toBe(false);
    expect(result.receipt).toBeUndefined();
    expect(result.response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// MppPayClient.pay — full 402 flow
// ---------------------------------------------------------------------------

describe("MppPayClient.pay — 402 flow", () => {
  it("pays and retries on 402", async () => {
    // First call: 402
    mockFetch.mockResolvedValueOnce(make402Response("0.01"));
    // Second call: 200 (after payment)
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ result: "success" }), { status: 200 }),
    );

    const usdcx = mockUsdcx();
    const safeguards = new SafeguardManager();
    const client = new MppPayClient(usdcx, safeguards, AGENT_PARTY, "testnet");

    const result = await client.pay("https://api.example.com/data");

    expect(result.paid).toBe(true);
    expect(result.receipt).toBeDefined();
    expect(result.receipt!.updateId).toBe("upd-pay");
    expect(result.receipt!.amount).toBe("0.01");
    expect(result.response.status).toBe(200);

    // Verify transfer was called
    expect(usdcx.transfer).toHaveBeenCalledWith({
      recipient: GATEWAY_PARTY,
      amount: "0.01",
    });

    // Verify retry includes Authorization header
    const retryCall = mockFetch.mock.calls[1];
    const retryHeaders = retryCall[1]?.headers as Record<string, string>;
    expect(retryHeaders.Authorization).toMatch(/^Payment /);

    // Verify credential is valid base64 JSON
    const credBase64 = retryHeaders.Authorization.replace("Payment ", "");
    const cred = JSON.parse(Buffer.from(credBase64, "base64").toString("utf-8"));
    expect(cred.updateId).toBe("upd-pay");
    expect(cred.sender).toBe(AGENT_PARTY);
    expect(cred.commandId).toBe("cmd-pay");
  });

  it("records spend in safeguards", async () => {
    mockFetch.mockResolvedValueOnce(make402Response("5.00"));
    mockFetch.mockResolvedValueOnce(new Response("ok", { status: 200 }));

    const safeguards = new SafeguardManager();
    const client = new MppPayClient(mockUsdcx(), safeguards, AGENT_PARTY, "testnet");

    await client.pay("https://api.example.com/data");

    expect(safeguards.settings().dailySpent).toBe("5");
  });
});

// ---------------------------------------------------------------------------
// MppPayClient.pay — error cases
// ---------------------------------------------------------------------------

describe("MppPayClient.pay — errors", () => {
  it("throws on network mismatch", async () => {
    const header = `Payment method="canton", amount="0.01", currency="USDCx", recipient="${GATEWAY_PARTY}", network="mainnet"`;
    mockFetch.mockResolvedValueOnce(
      new Response("", { status: 402, headers: { "WWW-Authenticate": header } }),
    );

    const client = new MppPayClient(mockUsdcx(), new SafeguardManager(), AGENT_PARTY, "testnet");

    await expect(client.pay("https://api.example.com/data")).rejects.toThrow(
      "Network mismatch",
    );
  });

  it("throws when price exceeds maxPrice", async () => {
    mockFetch.mockResolvedValueOnce(make402Response("10.00"));

    const client = new MppPayClient(mockUsdcx(), new SafeguardManager(), AGENT_PARTY, "testnet");

    await expect(
      client.pay("https://api.example.com/data", { maxPrice: "5.00" }),
    ).rejects.toThrow("exceeds maxPrice");
  });

  it("throws when safeguards block payment", async () => {
    mockFetch.mockResolvedValueOnce(make402Response("0.01"));

    const safeguards = new SafeguardManager();
    safeguards.lock("1234");
    const client = new MppPayClient(mockUsdcx(), safeguards, AGENT_PARTY, "testnet");

    await expect(client.pay("https://api.example.com/data")).rejects.toThrow(
      "Safeguard rejected",
    );
  });

  it("throws on 402 without valid challenge header", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("", { status: 402, headers: { "WWW-Authenticate": "Bearer realm=\"api\"" } }),
    );

    const client = new MppPayClient(mockUsdcx(), new SafeguardManager(), AGENT_PARTY, "testnet");

    await expect(client.pay("https://api.example.com/data")).rejects.toThrow(
      "no valid Canton payment challenge",
    );
  });

  it("throws on 402 without WWW-Authenticate header", async () => {
    mockFetch.mockResolvedValueOnce(new Response("", { status: 402 }));

    const client = new MppPayClient(mockUsdcx(), new SafeguardManager(), AGENT_PARTY, "testnet");

    await expect(client.pay("https://api.example.com/data")).rejects.toThrow(
      "no valid Canton payment challenge",
    );
  });

  it("passes custom method and body to requests", async () => {
    mockFetch.mockResolvedValueOnce(make402Response("0.01"));
    mockFetch.mockResolvedValueOnce(new Response("ok", { status: 200 }));

    const client = new MppPayClient(mockUsdcx(), new SafeguardManager(), AGENT_PARTY, "testnet");

    await client.pay("https://api.example.com/data", {
      method: "POST",
      body: JSON.stringify({ prompt: "hello" }),
      headers: { "Content-Type": "application/json" },
    });

    // Both requests should use POST
    expect(mockFetch.mock.calls[0][1]?.method).toBe("POST");
    expect(mockFetch.mock.calls[1][1]?.method).toBe("POST");

    // Retry should include both content-type and authorization
    const retryHeaders = mockFetch.mock.calls[1][1]?.headers as Record<string, string>;
    expect(retryHeaders["Content-Type"]).toBe("application/json");
    expect(retryHeaders.Authorization).toMatch(/^Payment /);
  });
});
