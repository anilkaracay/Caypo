/**
 * SafeguardManager — pre-transaction checks: tx limit, daily limit, lock.
 *
 * Storage: ~/.caypo/safeguards.json
 * All amounts are strings (no floating point).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { addAmounts, compareAmounts, subtractAmounts } from "../canton/amount.js";

const DEFAULT_SAFEGUARDS_PATH = join(homedir(), ".caypo", "safeguards.json");

export interface SafeguardConfig {
  txLimit: string;
  dailyLimit: string;
  locked: boolean;
  lockedPinHash: string;
  dailySpent: string;
  lastResetDate: string; // YYYY-MM-DD
}

export interface CheckResult {
  allowed: boolean;
  reason?: string;
  dailyRemaining: string;
}

const DEFAULT_SAFEGUARD_CONFIG: SafeguardConfig = {
  txLimit: "100",
  dailyLimit: "1000",
  locked: false,
  lockedPinHash: "",
  dailySpent: "0",
  lastResetDate: today(),
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Simple hash for PIN verification (not cryptographic — just a gate). */
function hashPin(pin: string): string {
  // Use a basic hash since this is just a confirmation gate, not security-critical.
  // The real security is the encrypted keystore.
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const ch = pin.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return String(hash);
}

export class SafeguardManager {
  private config: SafeguardConfig;
  private readonly filePath: string;

  constructor(config?: SafeguardConfig, filePath?: string) {
    this.config = config ? { ...config } : { ...DEFAULT_SAFEGUARD_CONFIG };
    this.filePath = filePath ?? DEFAULT_SAFEGUARDS_PATH;
  }

  /**
   * Load safeguards from disk. Returns a new SafeguardManager.
   * If file doesn't exist, uses defaults.
   */
  static async load(path?: string): Promise<SafeguardManager> {
    const filePath = path ?? DEFAULT_SAFEGUARDS_PATH;

    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<SafeguardConfig>;
      const config: SafeguardConfig = { ...DEFAULT_SAFEGUARD_CONFIG, ...parsed };
      return new SafeguardManager(config, filePath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return new SafeguardManager(undefined, filePath);
      }
      throw err;
    }
  }

  /** Get current safeguard settings. */
  settings(): SafeguardConfig {
    return { ...this.config };
  }

  /** Set per-transaction limit. */
  setTxLimit(amount: string): void {
    this.config.txLimit = amount;
    void this.save();
  }

  /** Set daily spending limit. */
  setDailyLimit(amount: string): void {
    this.config.dailyLimit = amount;
    void this.save();
  }

  /** Lock the wallet. All transactions will be rejected until unlocked. */
  lock(pin?: string): void {
    this.config.locked = true;
    if (pin) {
      this.config.lockedPinHash = hashPin(pin);
    }
    void this.save();
  }

  /** Unlock the wallet. Requires PIN if one was set during lock. */
  unlock(pin: string): void {
    if (this.config.lockedPinHash && hashPin(pin) !== this.config.lockedPinHash) {
      throw new Error("Invalid PIN");
    }
    this.config.locked = false;
    this.config.lockedPinHash = "";
    void this.save();
  }

  /**
   * Check if a transaction for the given amount is allowed.
   * Auto-resets daily counter if the date has changed.
   */
  check(amount: string): CheckResult {
    this.autoResetDaily();

    const dailyRemaining = subtractAmounts(this.config.dailyLimit, this.config.dailySpent);

    if (this.config.locked) {
      return { allowed: false, reason: "Wallet is locked", dailyRemaining };
    }

    if (compareAmounts(amount, this.config.txLimit) > 0) {
      return {
        allowed: false,
        reason: `Amount ${amount} exceeds per-transaction limit of ${this.config.txLimit}`,
        dailyRemaining,
      };
    }

    const projectedDaily = addAmounts(this.config.dailySpent, amount);
    if (compareAmounts(projectedDaily, this.config.dailyLimit) > 0) {
      return {
        allowed: false,
        reason: `Amount ${amount} would exceed daily limit of ${this.config.dailyLimit} (spent: ${this.config.dailySpent})`,
        dailyRemaining,
      };
    }

    return { allowed: true, dailyRemaining };
  }

  /** Record a completed spend. Call after successful transaction. */
  recordSpend(amount: string): void {
    this.autoResetDaily();
    this.config.dailySpent = addAmounts(this.config.dailySpent, amount);
    void this.save();
  }

  /** Manually reset the daily counter. */
  resetDaily(): void {
    this.config.dailySpent = "0";
    this.config.lastResetDate = today();
    void this.save();
  }

  private autoResetDaily(): void {
    const currentDate = today();
    if (this.config.lastResetDate !== currentDate) {
      this.config.dailySpent = "0";
      this.config.lastResetDate = currentDate;
    }
  }

  private async save(): Promise<void> {
    try {
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, JSON.stringify(this.config, null, 2), "utf8");
    } catch {
      // Best-effort save — in-memory state is still authoritative
    }
  }
}
