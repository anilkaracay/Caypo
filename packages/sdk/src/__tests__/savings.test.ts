import { beforeEach, describe, expect, it, vi } from "vitest";
import { SavingsAccount } from "../accounts/savings.js";
import { MockYieldProtocol } from "../protocols/yield.js";
import type { USDCxService } from "../canton/usdcx.js";

function mockUsdcx(): USDCxService {
  return { getBalance: vi.fn().mockResolvedValue("100"), getHoldings: vi.fn(), transfer: vi.fn(), mergeHoldings: vi.fn() } as unknown as USDCxService;
}

let savings: SavingsAccount;
let protocol: MockYieldProtocol;

beforeEach(() => {
  protocol = new MockYieldProtocol();
  savings = new SavingsAccount(mockUsdcx(), "Agent::1220");
  savings.addProtocol(protocol);
});

describe("SavingsAccount.deposit", () => {
  it("deposits amount and returns result", async () => {
    const r = await savings.deposit("50");
    expect(r.amount).toBe("50");
    expect(r.protocol).toBe("mock-yield");
    expect(r.positionId).toBeTruthy();
  });

  it("deposit 'all' uses full checking balance", async () => {
    const r = await savings.deposit("all");
    expect(r.amount).toBe("100");
  });

  it("rejects deposit of 0", async () => {
    await expect(savings.deposit("0")).rejects.toThrow("must be > 0");
  });

  it("accumulates multiple deposits", async () => {
    await savings.deposit("30");
    await savings.deposit("20");
    const bal = await savings.balance();
    expect(bal.deposited).toBe("50");
  });
});

describe("SavingsAccount.withdraw", () => {
  it("withdraws from yield", async () => {
    await savings.deposit("100");
    const r = await savings.withdraw("50");
    expect(r.amount).toBe("50");
    expect(r.protocol).toBe("mock-yield");
  });

  it("withdraw 'all' returns everything", async () => {
    await savings.deposit("100");
    const r = await savings.withdraw("all");
    expect(parseFloat(r.amount)).toBeGreaterThanOrEqual(100);
  });

  it("rejects over-withdrawal", async () => {
    await savings.deposit("10");
    await expect(savings.withdraw("999")).rejects.toThrow("Insufficient");
  });
});

describe("SavingsAccount.balance", () => {
  it("returns zero for empty account", async () => {
    const bal = await savings.balance();
    expect(bal.deposited).toBe("0");
    expect(bal.earned).toBe("0");
    expect(bal.apy).toBe("4.0");
  });

  it("returns deposited amount after deposit", async () => {
    await savings.deposit("75");
    const bal = await savings.balance();
    expect(bal.deposited).toBe("75");
    expect(bal.protocol).toBe("mock-yield");
  });
});

describe("SavingsAccount.earnings", () => {
  it("returns earnings report", async () => {
    await savings.deposit("1000");
    const e = await savings.earnings();
    expect(e.protocols).toHaveLength(1);
    expect(e.protocols[0].name).toBe("mock-yield");
  });
});

describe("SavingsAccount.positions", () => {
  it("returns empty for no deposits", async () => {
    const p = await savings.positions();
    expect(p).toEqual([]);
  });

  it("returns position after deposit", async () => {
    await savings.deposit("50");
    const p = await savings.positions();
    expect(p).toHaveLength(1);
    expect(p[0].deposited).toBe("50");
    expect(p[0].protocol).toBe("mock-yield");
  });
});

describe("SavingsAccount.rebalance", () => {
  it("returns moved=false with single protocol", async () => {
    const r = await savings.rebalance();
    expect(r.moved).toBe(false);
  });

  it("moves to higher APY protocol", async () => {
    const betterProtocol = new MockYieldProtocol();
    // Override getApy
    betterProtocol.getApy = async () => "8.0";
    (betterProtocol as any).name = "better-yield";
    savings.addProtocol(betterProtocol);

    await savings.deposit("100");
    const r = await savings.rebalance();
    expect(r.moved).toBe(true);
    expect(r.to).toBe("better-yield");
  });
});

describe("SavingsAccount — no protocol", () => {
  it("throws if no protocol configured", async () => {
    const empty = new SavingsAccount(mockUsdcx(), "Agent::1220");
    await expect(empty.deposit("10")).rejects.toThrow("No yield protocol");
  });
});
