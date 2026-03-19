import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExchangeAccount } from "../accounts/exchange.js";
import { MockDexProtocol } from "../protocols/dex.js";
import type { CantonClient } from "../canton/client.js";

const mockClient = {} as CantonClient;
let exchange: ExchangeAccount;

beforeEach(() => {
  exchange = new ExchangeAccount(new MockDexProtocol(), mockClient, "Agent::1220");
});

describe("ExchangeAccount.quote", () => {
  it("returns quote for USDCx to CC", async () => {
    const q = await exchange.quote("100", "USDCx", "CC");
    expect(q.from).toBe("USDCx");
    expect(q.to).toBe("CC");
    expect(q.inputAmount).toBe("100");
    expect(parseFloat(q.outputAmount)).toBeGreaterThan(0);
    expect(parseFloat(q.rate)).toBeGreaterThan(0);
    expect(parseFloat(q.fee)).toBeGreaterThan(0);
  });

  it("returns quote for CC to USDCx", async () => {
    const q = await exchange.quote("1000", "CC", "USDCx");
    expect(q.from).toBe("CC");
    expect(q.to).toBe("USDCx");
    expect(parseFloat(q.outputAmount)).toBeGreaterThan(0);
  });

  it("rejects unsupported pair", async () => {
    await expect(exchange.quote("100", "ETH", "BTC")).rejects.toThrow("Unsupported pair");
  });

  it("includes price impact for large amounts", async () => {
    const small = await exchange.quote("10", "USDCx", "CC");
    const large = await exchange.quote("50000", "USDCx", "CC");
    expect(parseFloat(large.priceImpact)).toBeGreaterThan(parseFloat(small.priceImpact));
  });
});

describe("ExchangeAccount.swap", () => {
  it("executes swap successfully", async () => {
    const r = await exchange.swap("100", "USDCx", "CC");
    expect(r.txId).toBeTruthy();
    expect(parseFloat(r.outputAmount)).toBeGreaterThan(0);
    expect(r.from).toBe("USDCx");
    expect(r.to).toBe("CC");
  });

  it("respects max slippage", async () => {
    // Small swap should succeed with tight slippage
    const r = await exchange.swap("10", "USDCx", "CC", { maxSlippage: "1.0" });
    expect(r.txId).toBeTruthy();
  });

  it("rejects swap exceeding slippage", async () => {
    // Very large swap + tiny slippage tolerance
    await expect(
      exchange.swap("100000", "USDCx", "CC", { maxSlippage: "0.001" }),
    ).rejects.toThrow("exceeds max slippage");
  });
});

describe("ExchangeAccount.pairs", () => {
  it("returns available trading pairs", async () => {
    const p = await exchange.pairs();
    expect(p.length).toBeGreaterThan(0);
    expect(p[0].base).toBe("CC");
    expect(p[0].quote).toBe("USDCx");
  });
});

describe("ExchangeAccount.rates", () => {
  it("returns current exchange rates", async () => {
    const r = await exchange.rates();
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].pair).toBe("CC/USDCx");
    expect(parseFloat(r[0].rate)).toBeGreaterThan(0);
  });
});
