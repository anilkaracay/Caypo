import { beforeEach, describe, expect, it, vi } from "vitest";
import { CantonAgent } from "../agent.js";
import type { CantonClient } from "../canton/client.js";
import { SafeguardManager } from "../safeguards/manager.js";

// ---------------------------------------------------------------------------
// Mock CantonClient
// ---------------------------------------------------------------------------

const PARTY = "Agent::1220abcdef1234567890";
const USDCX_TEMPLATE = "Splice.Api.Token.HoldingV1:Holding";

function mockClient(): CantonClient {
  return {
    getLedgerEnd: vi.fn().mockResolvedValue(42),
    queryActiveContracts: vi.fn().mockResolvedValue([
      {
        contractId: "cid-1",
        templateId: USDCX_TEMPLATE,
        createArgument: { owner: PARTY, amount: "50.000000" },
        createdAt: "",
        signatories: [PARTY],
        observers: [],
      },
      {
        contractId: "cid-2",
        templateId: USDCX_TEMPLATE,
        createArgument: { owner: PARTY, amount: "30.000000" },
        createdAt: "",
        signatories: [PARTY],
        observers: [],
      },
    ]),
    submitAndWait: vi.fn().mockResolvedValue({ updateId: "upd-1", completionOffset: 43 }),
    submitAndWaitForTransaction: vi.fn(),
    getTransactionById: vi.fn(),
    allocateParty: vi.fn(),
    listParties: vi.fn(),
    isHealthy: vi.fn().mockResolvedValue(true),
  } as unknown as CantonClient;
}

// ---------------------------------------------------------------------------
// CantonAgent.fromParams
// ---------------------------------------------------------------------------

describe("CantonAgent.fromParams", () => {
  it("creates agent with all sub-services", () => {
    const client = mockClient();
    const agent = CantonAgent.fromParams({
      client,
      partyId: PARTY,
      network: "testnet",
    });

    expect(agent.checking).toBeDefined();
    expect(agent.safeguards).toBeDefined();
    expect(agent.traffic).toBeDefined();
    expect(agent.mpp).toBeDefined();
    expect(agent.wallet).toBeDefined();
  });

  it("wallet has correct address and network", () => {
    const client = mockClient();
    const agent = CantonAgent.fromParams({
      client,
      partyId: PARTY,
      network: "testnet",
    });

    expect(agent.wallet.address).toBe(PARTY);
    expect(agent.wallet.partyId).toBe(PARTY);
    expect(agent.wallet.network).toBe("testnet");
  });
});

// ---------------------------------------------------------------------------
// CheckingAccount via CantonAgent
// ---------------------------------------------------------------------------

describe("CantonAgent.checking", () => {
  let agent: CantonAgent;

  beforeEach(() => {
    const client = mockClient();
    agent = CantonAgent.fromParams({
      client,
      partyId: PARTY,
      network: "testnet",
    });
  });

  it("balance returns sum of holdings", async () => {
    const bal = await agent.checking.balance();

    expect(bal.available).toBe("80");
    expect(bal.holdingCount).toBe(2);
  });

  it("address returns party ID", () => {
    expect(agent.checking.address()).toBe(PARTY);
  });

  it("send checks safeguards and transfers", async () => {
    const result = await agent.checking.send("Bob::1220bbbb", "10");

    expect(result.updateId).toBe("upd-1");
    expect(result.completionOffset).toBe(43);
    expect(result.commandId).toBeTruthy();
  });

  it("send records spend in safeguards", async () => {
    await agent.checking.send("Bob::1220bbbb", "25");

    const settings = agent.safeguards.settings();
    expect(settings.dailySpent).toBe("25");
  });

  it("send rejects when safeguards block it", async () => {
    agent.safeguards.lock("1234");

    await expect(agent.checking.send("Bob::1220bbbb", "10")).rejects.toThrow(
      "Safeguard rejected",
    );
  });

  it("send rejects when amount exceeds tx limit", async () => {
    agent.safeguards.setTxLimit("5");

    await expect(agent.checking.send("Bob::1220bbbb", "10")).rejects.toThrow(
      "per-transaction limit",
    );
  });

  it("send rejects when daily limit exceeded", async () => {
    agent.safeguards.setDailyLimit("20");
    agent.safeguards.recordSpend("15");

    await expect(agent.checking.send("Bob::1220bbbb", "10")).rejects.toThrow(
      "daily limit",
    );
  });
});

// ---------------------------------------------------------------------------
// TrafficManager via CantonAgent
// ---------------------------------------------------------------------------

describe("CantonAgent.traffic", () => {
  it("reports sufficient traffic when healthy", async () => {
    const client = mockClient();
    const agent = CantonAgent.fromParams({
      client,
      partyId: PARTY,
      network: "testnet",
    });

    const sufficient = await agent.traffic.hasSufficientTraffic();
    expect(sufficient).toBe(true);
  });

  it("reports insufficient traffic when unhealthy", async () => {
    const client = mockClient();
    (client.isHealthy as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const agent = CantonAgent.fromParams({
      client,
      partyId: PARTY,
      network: "testnet",
    });

    const sufficient = await agent.traffic.hasSufficientTraffic();
    expect(sufficient).toBe(false);
  });

  it("trafficBalance returns numbers", async () => {
    const client = mockClient();
    const agent = CantonAgent.fromParams({
      client,
      partyId: PARTY,
      network: "testnet",
    });

    const balance = await agent.traffic.trafficBalance();
    expect(typeof balance.totalPurchased).toBe("number");
    expect(typeof balance.consumed).toBe("number");
    expect(typeof balance.remaining).toBe("number");
    expect(balance.remaining).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Custom safeguards
// ---------------------------------------------------------------------------

describe("CantonAgent with custom safeguards", () => {
  it("accepts custom SafeguardManager", () => {
    const client = mockClient();
    const safeguards = new SafeguardManager({
      txLimit: "5",
      dailyLimit: "50",
      locked: false,
      lockedPinHash: "",
      dailySpent: "0",
      lastResetDate: new Date().toISOString().slice(0, 10),
    });

    const agent = CantonAgent.fromParams({
      client,
      partyId: PARTY,
      network: "testnet",
      safeguards,
    });

    expect(agent.safeguards.settings().txLimit).toBe("5");
  });
});
