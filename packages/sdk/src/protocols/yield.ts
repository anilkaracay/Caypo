/**
 * Yield protocol adapter interface + MockYieldProtocol.
 */

import type { CantonClient } from "../canton/client.js";
import { addAmounts, subtractAmounts, compareAmounts } from "../canton/amount.js";

export interface DepositResult {
  positionId: string;
  amount: string;
  protocol: string;
  timestamp: string;
}

export interface WithdrawResult {
  amount: string;
  earned: string;
  protocol: string;
  timestamp: string;
}

export interface YieldBalance {
  deposited: string;
  earned: string;
  total: string;
  apy: string;
  protocol: string;
}

export interface YieldProtocol {
  name: string;
  deposit(client: CantonClient, partyId: string, amount: string): Promise<DepositResult>;
  withdraw(client: CantonClient, partyId: string, amount: string): Promise<WithdrawResult>;
  getBalance(client: CantonClient, partyId: string): Promise<YieldBalance>;
  getApy(): Promise<string>;
}

/**
 * Mock yield protocol for testing and demo. Simulates 4% APY.
 * Tracks state in-memory.
 */
export class MockYieldProtocol implements YieldProtocol {
  readonly name = "mock-yield";
  private deposited = "0";
  private depositTimestamp = 0;

  async deposit(_client: CantonClient, _partyId: string, amount: string): Promise<DepositResult> {
    this.deposited = addAmounts(this.deposited, amount);
    this.depositTimestamp = Date.now();
    return {
      positionId: `pos-${Date.now()}`,
      amount,
      protocol: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  async withdraw(_client: CantonClient, _partyId: string, amount: string): Promise<WithdrawResult> {
    const balance = await this.getBalance(_client, _partyId);
    const withdrawAmount = amount === "all" ? balance.total : amount;

    if (compareAmounts(withdrawAmount, balance.total) > 0) {
      throw new Error(`Insufficient yield balance: have ${balance.total}, withdrawing ${withdrawAmount}`);
    }

    const earned = balance.earned;
    this.deposited = compareAmounts(withdrawAmount, this.deposited) >= 0
      ? "0"
      : subtractAmounts(this.deposited, withdrawAmount);

    return {
      amount: withdrawAmount,
      earned,
      protocol: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  async getBalance(_client: CantonClient, _partyId: string): Promise<YieldBalance> {
    const earned = this.calcEarned();
    const total = addAmounts(this.deposited, earned);
    return {
      deposited: this.deposited,
      earned,
      total,
      apy: "4.0",
      protocol: this.name,
    };
  }

  async getApy(): Promise<string> {
    return "4.0";
  }

  private calcEarned(): string {
    if (this.depositTimestamp === 0 || this.deposited === "0") return "0";
    const elapsed = (Date.now() - this.depositTimestamp) / (365.25 * 24 * 3600 * 1000);
    const principal = parseFloat(this.deposited);
    const earned = principal * 0.04 * elapsed;
    return earned > 0.000001 ? earned.toFixed(6) : "0";
  }

  /** For testing: inject deposited state. */
  _setDeposited(amount: string, timestamp?: number): void {
    this.deposited = amount;
    this.depositTimestamp = timestamp ?? Date.now();
  }
}
