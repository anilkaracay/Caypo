import { beforeEach, describe, expect, it } from "vitest";
import { CreditAccount } from "../accounts/credit.js";
import { MockLendingProtocol } from "../protocols/lending.js";

let credit: CreditAccount;
let lending: MockLendingProtocol;

beforeEach(() => {
  lending = new MockLendingProtocol();
  lending._setCollateral("1000");
  credit = new CreditAccount(lending, "Agent::1220");
});

describe("CreditAccount.borrow", () => {
  it("borrows USDCx successfully", async () => {
    const r = await credit.borrow("100");
    expect(r.amount).toBe("100");
    expect(r.rate).toBe("7.83");
    expect(r.loanId).toBeTruthy();
  });

  it("rejects borrow of 0", async () => {
    await expect(credit.borrow("0")).rejects.toThrow("must be > 0");
  });

  it("rejects borrow that would drop health below 1.5", async () => {
    // Collateral 1000, max safe borrow at 1.5 HF = 1000/1.5 = 666
    await expect(credit.borrow("700")).rejects.toThrow("health factor would drop");
  });

  it("allows borrow within safe health range", async () => {
    const r = await credit.borrow("500"); // 1000/500 = 2.0 HF > 1.5
    expect(r.amount).toBe("500");
  });

  it("accumulates debt across borrows", async () => {
    await credit.borrow("200");
    await credit.borrow("200");
    const bal = await credit.balance();
    expect(bal.borrowed).toBe("400");
  });

  it("rejects when second borrow would exceed safe limit", async () => {
    await credit.borrow("400"); // HF = 1000/400 = 2.5
    await expect(credit.borrow("300")).rejects.toThrow("health factor"); // would be 1000/700 = 1.43
  });
});

describe("CreditAccount.repay", () => {
  it("repays borrowed amount", async () => {
    await credit.borrow("100");
    const r = await credit.repay("100");
    expect(parseFloat(r.remainingDebt)).toBeLessThanOrEqual(1); // small interest
  });

  it("repay 'all' clears debt", async () => {
    await credit.borrow("100");
    const r = await credit.repay("all");
    expect(r.remainingDebt).toBe("0");
  });

  it("rejects over-repayment", async () => {
    await credit.borrow("100");
    await expect(credit.repay("999")).rejects.toThrow("exceeds total owed");
  });

  it("partial repay reduces debt", async () => {
    await credit.borrow("200");
    await credit.repay("50");
    const bal = await credit.balance();
    expect(parseFloat(bal.borrowed)).toBeLessThan(200);
  });
});

describe("CreditAccount.health", () => {
  it("returns high health with no debt", async () => {
    const h = await credit.health();
    expect(parseFloat(h.healthFactor)).toBeGreaterThan(100);
    expect(h.collateral).toBe("1000");
    expect(h.debt).toBe("0");
  });

  it("returns correct health after borrow", async () => {
    await credit.borrow("500");
    const h = await credit.health();
    expect(parseFloat(h.healthFactor)).toBeCloseTo(2.0, 0);
    expect(h.rate).toBe("7.83");
    expect(h.liquidationThreshold).toBe("0.80");
  });

  it("max borrow is 75% of collateral", async () => {
    const h = await credit.health();
    expect(h.maxBorrow).toBe("750.00");
  });
});

describe("CreditAccount.balance", () => {
  it("returns zero debt for no borrows", async () => {
    const bal = await credit.balance();
    expect(bal.borrowed).toBe("0");
    expect(bal.totalOwed).toBe("0");
  });

  it("returns debt info after borrow", async () => {
    await credit.borrow("300");
    const bal = await credit.balance();
    expect(bal.borrowed).toBe("300");
    expect(bal.rate).toBe("7.83");
    expect(parseFloat(bal.totalOwed)).toBeGreaterThanOrEqual(300);
  });
});
