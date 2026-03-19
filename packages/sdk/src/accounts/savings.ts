/**
 * SavingsAccount — deposit USDCx into yield-generating positions.
 * Uses protocol adapter pattern for pluggable DeFi integrations.
 */

import { addAmounts, compareAmounts, subtractAmounts } from "../canton/amount.js";
import type { USDCxService } from "../canton/usdcx.js";
import type { YieldProtocol, YieldBalance, DepositResult, WithdrawResult } from "../protocols/yield.js";

export interface DeFiPosition {
  protocol: string;
  deposited: string;
  earned: string;
  apy: string;
}

export interface EarningsReport {
  total: string;
  protocols: Array<{ name: string; earned: string }>;
}

export class SavingsAccount {
  private protocols: YieldProtocol[] = [];

  constructor(
    private readonly usdcx: USDCxService,
    private readonly partyId: string,
  ) {}

  /** Register a yield protocol adapter. */
  addProtocol(protocol: YieldProtocol): void {
    this.protocols.push(protocol);
  }

  private getDefault(): YieldProtocol {
    if (this.protocols.length === 0) {
      throw new Error("No yield protocol configured. Call addProtocol() first.");
    }
    return this.protocols[0];
  }

  /** Deposit USDCx into the default yield protocol. */
  async deposit(amount: string): Promise<DepositResult> {
    const protocol = this.getDefault();

    if (amount === "all") {
      amount = await this.usdcx.getBalance();
    }

    if (compareAmounts(amount, "0") <= 0) {
      throw new Error("Deposit amount must be > 0");
    }

    // In a real implementation, this would transfer USDCx to the protocol's contract.
    // The mock protocol tracks state in-memory.
    return protocol.deposit(null as never, this.partyId, amount);
  }

  /** Withdraw from the default yield protocol back to checking. */
  async withdraw(amount: string): Promise<WithdrawResult> {
    const protocol = this.getDefault();
    return protocol.withdraw(null as never, this.partyId, amount);
  }

  /** Get savings balance across all protocols. */
  async balance(): Promise<YieldBalance> {
    const protocol = this.getDefault();
    return protocol.getBalance(null as never, this.partyId);
  }

  /** Compare APYs across protocols and move to highest. */
  async rebalance(): Promise<{ moved: boolean; from?: string; to?: string; apy?: string }> {
    if (this.protocols.length < 2) {
      return { moved: false };
    }

    let bestProtocol = this.protocols[0];
    let bestApy = parseFloat(await bestProtocol.getApy());

    for (let i = 1; i < this.protocols.length; i++) {
      const apy = parseFloat(await this.protocols[i].getApy());
      if (apy > bestApy) {
        bestApy = apy;
        bestProtocol = this.protocols[i];
      }
    }

    const current = this.getDefault();
    if (bestProtocol.name === current.name) {
      return { moved: false };
    }

    // Withdraw from current, deposit to best
    const bal = await current.getBalance(null as never, this.partyId);
    if (compareAmounts(bal.total, "0") <= 0) {
      return { moved: false };
    }

    await current.withdraw(null as never, this.partyId, "all");
    await bestProtocol.deposit(null as never, this.partyId, bal.total);

    return { moved: true, from: current.name, to: bestProtocol.name, apy: bestApy.toString() };
  }

  /** Get earnings from all protocols. */
  async earnings(): Promise<EarningsReport> {
    let total = "0";
    const protocols: Array<{ name: string; earned: string }> = [];

    for (const p of this.protocols) {
      const bal = await p.getBalance(null as never, this.partyId);
      total = addAmounts(total, bal.earned);
      protocols.push({ name: p.name, earned: bal.earned });
    }

    return { total, protocols };
  }

  /** Get all DeFi positions. */
  async positions(): Promise<DeFiPosition[]> {
    const result: DeFiPosition[] = [];
    for (const p of this.protocols) {
      const bal = await p.getBalance(null as never, this.partyId);
      if (compareAmounts(bal.deposited, "0") > 0 || compareAmounts(bal.earned, "0") > 0) {
        result.push({
          protocol: p.name,
          deposited: bal.deposited,
          earned: bal.earned,
          apy: bal.apy,
        });
      }
    }
    return result;
  }
}
