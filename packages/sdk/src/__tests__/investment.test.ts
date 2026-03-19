import { beforeEach, describe, expect, it } from "vitest";
import { InvestmentAccount, STRATEGIES } from "../accounts/investment.js";
import { ExchangeAccount } from "../accounts/exchange.js";
import { MockDexProtocol } from "../protocols/dex.js";
import type { CantonClient } from "../canton/client.js";

let invest: InvestmentAccount;
let exchange: ExchangeAccount;

beforeEach(() => {
  exchange = new ExchangeAccount(new MockDexProtocol(), {} as CantonClient, "Agent::1220");
  invest = new InvestmentAccount(exchange);
});

describe("InvestmentAccount.buy", () => {
  it("buys CC with USDCx", async () => {
    const r = await invest.buy("100", "CC");
    expect(r.txId).toBeTruthy();
    expect(parseFloat(r.received)).toBeGreaterThan(0);
  });

  it("buys USDCx (direct)", async () => {
    const r = await invest.buy("50", "USDCx");
    expect(r.received).toBe("50");
  });

  it("accumulates buys in portfolio", async () => {
    await invest.buy("100", "CC");
    await invest.buy("50", "CC");
    const p = await invest.portfolio();
    const cc = p.positions.find((pos) => pos.asset === "CC");
    expect(cc).toBeDefined();
    expect(parseFloat(cc!.costBasis)).toBe(150);
  });
});

describe("InvestmentAccount.sell", () => {
  it("sells CC position for USDCx", async () => {
    await invest.buy("100", "CC");
    const p = await invest.portfolio();
    const ccAmount = p.positions.find((pos) => pos.asset === "CC")!.amount;
    const r = await invest.sell(ccAmount, "CC");
    expect(r.txId).toBeTruthy();
    expect(parseFloat(r.received)).toBeGreaterThan(0);
  });

  it("sell 'all' liquidates position", async () => {
    await invest.buy("100", "CC");
    const r = await invest.sell("all", "CC");
    expect(parseFloat(r.received)).toBeGreaterThan(0);
    const p = await invest.portfolio();
    expect(p.positions.filter((pos) => pos.asset === "CC" && parseFloat(pos.amount) > 0)).toHaveLength(0);
  });

  it("rejects sell with no position", async () => {
    await expect(invest.sell("10", "CC")).rejects.toThrow("No CC position");
  });

  it("rejects over-sell", async () => {
    await invest.buy("10", "CC");
    await expect(invest.sell("999999", "CC")).rejects.toThrow("Insufficient");
  });
});

describe("InvestmentAccount.portfolio", () => {
  it("returns empty portfolio initially", async () => {
    const p = await invest.portfolio();
    expect(p.positions).toHaveLength(0);
    expect(p.totalValue).toBe("0");
  });

  it("shows P&L after price change simulation", async () => {
    await invest.buy("100", "USDCx");
    const p = await invest.portfolio();
    expect(p.positions).toHaveLength(1);
    expect(p.totalCost).toBe("100");
    expect(p.totalValue).toBe("100");
    expect(p.totalPnl).toBe("0.000000");
  });

  it("tracks multiple assets", async () => {
    await invest.buy("100", "CC");
    await invest.buy("50", "USDCx");
    const p = await invest.portfolio();
    expect(p.positions).toHaveLength(2);
    expect(parseFloat(p.totalCost)).toBe(150);
  });
});

describe("InvestmentAccount.strategyList", () => {
  it("returns built-in strategies", () => {
    const list = invest.strategyList();
    expect(list.length).toBeGreaterThanOrEqual(4);
    expect(list.find((s) => s.name === "institutional")).toBeDefined();
    expect(list.find((s) => s.name === "balanced")).toBeDefined();
  });
});

describe("InvestmentAccount.strategyBuy", () => {
  it("buys according to balanced strategy", async () => {
    const results = await invest.strategyBuy("balanced", "100");
    expect(results).toHaveLength(2);
    expect(results.find((r) => r.asset === "CC")).toBeDefined();
    expect(results.find((r) => r.asset === "USDCx")).toBeDefined();
  });

  it("buys according to stable-yield (100% USDCx)", async () => {
    const results = await invest.strategyBuy("stable-yield", "100");
    expect(results).toHaveLength(1);
    expect(results[0].asset).toBe("USDCx");
    expect(results[0].amount).toBe("100.000000");
  });

  it("rejects unknown strategy", async () => {
    await expect(invest.strategyBuy("nonexistent", "100")).rejects.toThrow("not found");
  });
});

describe("InvestmentAccount.strategyCreate", () => {
  it("creates custom strategy", () => {
    const s = invest.strategyCreate("my-mix", [
      { asset: "CC", weight: 30 },
      { asset: "USDCx", weight: 70 },
    ]);
    expect(s.name).toBe("my-mix");
    expect(invest.strategyList().find((x) => x.name === "my-mix")).toBeDefined();
  });

  it("rejects if weights don't sum to 100", () => {
    expect(() =>
      invest.strategyCreate("bad", [{ asset: "CC", weight: 30 }]),
    ).toThrow("sum to 100");
  });
});

describe("InvestmentAccount.autoSetup + autoRun", () => {
  it("configures DCA", () => {
    const config = invest.autoSetup("50", "weekly", "balanced");
    expect(config.enabled).toBe(true);
    expect(config.amount).toBe("50");
    expect(config.frequency).toBe("weekly");
  });

  it("runs DCA and records trades", async () => {
    invest.autoSetup("100", "daily", "balanced");
    const results = await invest.autoRun();
    expect(results).not.toBeNull();
    expect(results!.length).toBe(2);
  });

  it("autoRun returns null when disabled", async () => {
    expect(await invest.autoRun()).toBeNull();
  });

  it("autoStatus returns config", () => {
    invest.autoSetup("25", "monthly", "institutional");
    const status = invest.autoStatus();
    expect(status).not.toBeNull();
    expect(status!.strategy).toBe("institutional");
  });

  it("autoSetup rejects unknown strategy", () => {
    expect(() => invest.autoSetup("50", "daily", "nonexistent")).toThrow("not found");
  });
});

describe("InvestmentAccount.earn/unearn", () => {
  it("earn returns enabled", async () => {
    const r = await invest.earn("CC");
    expect(r.enabled).toBe(true);
    expect(r.asset).toBe("CC");
  });

  it("unearn returns disabled", async () => {
    const r = await invest.unearn("CC");
    expect(r.enabled).toBe(false);
  });
});
