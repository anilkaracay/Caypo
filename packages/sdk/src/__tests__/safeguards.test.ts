import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SafeguardManager, type SafeguardConfig } from "../safeguards/manager.js";

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let tmpDir: string;
let safeguardsPath: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "caypo-safeguards-test-"));
  safeguardsPath = join(tmpDir, "safeguards.json");
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function makeConfig(overrides?: Partial<SafeguardConfig>): SafeguardConfig {
  return {
    txLimit: "100",
    dailyLimit: "1000",
    locked: false,
    lockedPinHash: "",
    dailySpent: "0",
    lastResetDate: new Date().toISOString().slice(0, 10),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// SafeguardManager.settings
// ---------------------------------------------------------------------------

describe("SafeguardManager.settings", () => {
  it("returns default settings when created without config", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    const s = mgr.settings();

    expect(s.txLimit).toBe("100");
    expect(s.dailyLimit).toBe("1000");
    expect(s.locked).toBe(false);
    expect(s.dailySpent).toBe("0");
  });

  it("returns a copy (mutations don't affect internal state)", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    const s = mgr.settings();
    s.txLimit = "999999";

    expect(mgr.settings().txLimit).toBe("100");
  });
});

// ---------------------------------------------------------------------------
// setTxLimit / setDailyLimit
// ---------------------------------------------------------------------------

describe("setTxLimit", () => {
  it("updates the per-transaction limit", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    mgr.setTxLimit("50");
    expect(mgr.settings().txLimit).toBe("50");
  });
});

describe("setDailyLimit", () => {
  it("updates the daily limit", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    mgr.setDailyLimit("500");
    expect(mgr.settings().dailyLimit).toBe("500");
  });
});

// ---------------------------------------------------------------------------
// lock / unlock
// ---------------------------------------------------------------------------

describe("lock / unlock", () => {
  it("lock sets locked to true", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    mgr.lock("1234");
    expect(mgr.settings().locked).toBe(true);
  });

  it("unlock with correct PIN sets locked to false", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    mgr.lock("1234");
    mgr.unlock("1234");
    expect(mgr.settings().locked).toBe(false);
  });

  it("unlock with wrong PIN throws", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    mgr.lock("1234");
    expect(() => mgr.unlock("wrong")).toThrow("Invalid PIN");
  });

  it("lock without PIN can be unlocked with any PIN", () => {
    const mgr = new SafeguardManager(undefined, safeguardsPath);
    mgr.lock();
    mgr.unlock("anything");
    expect(mgr.settings().locked).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// check — basic scenarios
// ---------------------------------------------------------------------------

describe("check — allowed", () => {
  it("allows transaction within both limits", () => {
    const mgr = new SafeguardManager(makeConfig(), safeguardsPath);
    const result = mgr.check("50");

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
    expect(result.dailyRemaining).toBe("1000");
  });

  it("allows transaction exactly at tx limit", () => {
    const mgr = new SafeguardManager(makeConfig({ txLimit: "100" }), safeguardsPath);
    const result = mgr.check("100");
    expect(result.allowed).toBe(true);
  });

  it("allows transaction exactly filling daily limit", () => {
    const mgr = new SafeguardManager(
      makeConfig({ dailyLimit: "100", dailySpent: "50" }),
      safeguardsPath,
    );
    const result = mgr.check("50");
    expect(result.allowed).toBe(true);
    expect(result.dailyRemaining).toBe("50");
  });
});

// ---------------------------------------------------------------------------
// check — rejected scenarios
// ---------------------------------------------------------------------------

describe("check — locked", () => {
  it("rejects when wallet is locked", () => {
    const mgr = new SafeguardManager(makeConfig({ locked: true }), safeguardsPath);
    const result = mgr.check("1");

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("locked");
  });
});

describe("check — exceeds tx limit", () => {
  it("rejects when amount > txLimit", () => {
    const mgr = new SafeguardManager(makeConfig({ txLimit: "10" }), safeguardsPath);
    const result = mgr.check("10.01");

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("per-transaction limit");
  });

  it("rejects large amount against small limit", () => {
    const mgr = new SafeguardManager(makeConfig({ txLimit: "0.01" }), safeguardsPath);
    const result = mgr.check("1");

    expect(result.allowed).toBe(false);
  });
});

describe("check — exceeds daily limit", () => {
  it("rejects when dailySpent + amount > dailyLimit", () => {
    const mgr = new SafeguardManager(
      makeConfig({ dailyLimit: "100", dailySpent: "90" }),
      safeguardsPath,
    );
    const result = mgr.check("20");

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("daily limit");
  });

  it("rejects when daily budget is exhausted", () => {
    const mgr = new SafeguardManager(
      makeConfig({ dailyLimit: "100", dailySpent: "100" }),
      safeguardsPath,
    );
    const result = mgr.check("0.01");

    expect(result.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// check — daily auto-reset
// ---------------------------------------------------------------------------

describe("check — daily auto-reset", () => {
  it("resets dailySpent when date changes", () => {
    const mgr = new SafeguardManager(
      makeConfig({
        dailyLimit: "100",
        dailySpent: "99",
        lastResetDate: "2025-01-01", // old date
      }),
      safeguardsPath,
    );

    // Should be reset since lastResetDate is in the past
    const result = mgr.check("50");
    expect(result.allowed).toBe(true);
    expect(result.dailyRemaining).toBe("100");
  });

  it("does not reset when date is current", () => {
    const today = new Date().toISOString().slice(0, 10);
    const mgr = new SafeguardManager(
      makeConfig({
        dailyLimit: "100",
        dailySpent: "90",
        lastResetDate: today,
      }),
      safeguardsPath,
    );

    const result = mgr.check("50");
    expect(result.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// recordSpend
// ---------------------------------------------------------------------------

describe("recordSpend", () => {
  it("accumulates daily spending", () => {
    const mgr = new SafeguardManager(makeConfig(), safeguardsPath);

    mgr.recordSpend("10");
    expect(mgr.settings().dailySpent).toBe("10");

    mgr.recordSpend("5.5");
    expect(mgr.settings().dailySpent).toBe("15.5");

    mgr.recordSpend("0.01");
    expect(mgr.settings().dailySpent).toBe("15.51");
  });

  it("auto-resets before recording if date changed", () => {
    const mgr = new SafeguardManager(
      makeConfig({
        dailySpent: "500",
        lastResetDate: "2025-01-01",
      }),
      safeguardsPath,
    );

    mgr.recordSpend("10");
    expect(mgr.settings().dailySpent).toBe("10");
  });
});

// ---------------------------------------------------------------------------
// resetDaily
// ---------------------------------------------------------------------------

describe("resetDaily", () => {
  it("resets dailySpent to 0 and updates lastResetDate", () => {
    const mgr = new SafeguardManager(
      makeConfig({ dailySpent: "500" }),
      safeguardsPath,
    );

    mgr.resetDaily();

    const s = mgr.settings();
    expect(s.dailySpent).toBe("0");
    expect(s.lastResetDate).toBe(new Date().toISOString().slice(0, 10));
  });
});

// ---------------------------------------------------------------------------
// SafeguardManager.load (from disk)
// ---------------------------------------------------------------------------

describe("SafeguardManager.load", () => {
  it("loads config from file", async () => {
    const config = makeConfig({ txLimit: "42", dailySpent: "17" });
    await writeFile(safeguardsPath, JSON.stringify(config), "utf8");

    const mgr = await SafeguardManager.load(safeguardsPath);
    expect(mgr.settings().txLimit).toBe("42");
    expect(mgr.settings().dailySpent).toBe("17");
  });

  it("returns defaults if file does not exist", async () => {
    const mgr = await SafeguardManager.load(join(tmpDir, "nonexistent.json"));
    expect(mgr.settings().txLimit).toBe("100");
    expect(mgr.settings().dailyLimit).toBe("1000");
  });
});

// ---------------------------------------------------------------------------
// Integration: check → recordSpend → check
// ---------------------------------------------------------------------------

describe("integration: check → spend → check", () => {
  it("tracks spending across multiple transactions", () => {
    const mgr = new SafeguardManager(
      makeConfig({ txLimit: "50", dailyLimit: "100" }),
      safeguardsPath,
    );

    // First tx: 40, allowed
    expect(mgr.check("40").allowed).toBe(true);
    mgr.recordSpend("40");

    // Second tx: 40, allowed (40 + 40 = 80 < 100)
    expect(mgr.check("40").allowed).toBe(true);
    mgr.recordSpend("40");

    // Third tx: 40, rejected (80 + 40 = 120 > 100)
    const result = mgr.check("40");
    expect(result.allowed).toBe(false);
    expect(result.dailyRemaining).toBe("20");

    // But 20 is still allowed
    expect(mgr.check("20").allowed).toBe(true);
  });
});
