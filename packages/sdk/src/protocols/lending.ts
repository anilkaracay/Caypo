/**
 * Lending protocol adapter interface + MockLendingProtocol.
 */

import type { CantonClient } from "../canton/client.js";
import { addAmounts, subtractAmounts, compareAmounts } from "../canton/amount.js";

export interface BorrowResult {
  loanId: string;
  amount: string;
  rate: string;
  protocol: string;
  timestamp: string;
}

export interface RepayResult {
  amount: string;
  interestPaid: string;
  remainingDebt: string;
  protocol: string;
  timestamp: string;
}

export interface HealthMetrics {
  healthFactor: string;
  collateral: string;
  debt: string;
  maxBorrow: string;
  liquidationThreshold: string;
  rate: string;
}

export interface DebtInfo {
  borrowed: string;
  interestAccrued: string;
  totalOwed: string;
  rate: string;
}

export interface LendingProtocol {
  name: string;
  borrow(client: CantonClient, partyId: string, amount: string): Promise<BorrowResult>;
  repay(client: CantonClient, partyId: string, amount: string): Promise<RepayResult>;
  getHealth(client: CantonClient, partyId: string): Promise<HealthMetrics>;
  getDebt(client: CantonClient, partyId: string): Promise<DebtInfo>;
}

/**
 * Mock lending protocol. 7.83% borrow rate, LTV 75%, liquidation at 80%.
 */
export class MockLendingProtocol implements LendingProtocol {
  readonly name = "mock-lending";
  private borrowed = "0";
  private collateral = "0";
  private borrowTimestamp = 0;

  async borrow(_client: CantonClient, _partyId: string, amount: string): Promise<BorrowResult> {
    this.borrowed = addAmounts(this.borrowed, amount);
    if (this.borrowTimestamp === 0) this.borrowTimestamp = Date.now();

    return {
      loanId: `loan-${Date.now()}`,
      amount,
      rate: "7.83",
      protocol: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  async repay(_client: CantonClient, _partyId: string, amount: string): Promise<RepayResult> {
    const debt = await this.getDebt(_client, _partyId);
    const repayAmount = amount === "all" ? debt.totalOwed : amount;

    if (compareAmounts(repayAmount, debt.totalOwed) > 0) {
      throw new Error(`Repay amount ${repayAmount} exceeds total owed ${debt.totalOwed}`);
    }

    const interestPaid = compareAmounts(repayAmount, debt.interestAccrued) <= 0
      ? repayAmount
      : debt.interestAccrued;

    const principalPaid = subtractAmounts(repayAmount, interestPaid);
    this.borrowed = compareAmounts(principalPaid, this.borrowed) >= 0
      ? "0"
      : subtractAmounts(this.borrowed, principalPaid);

    if (this.borrowed === "0") this.borrowTimestamp = 0;

    const remaining = await this.getDebt(_client, _partyId);

    return {
      amount: repayAmount,
      interestPaid,
      remainingDebt: remaining.totalOwed,
      protocol: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  async getHealth(_client: CantonClient, _partyId: string): Promise<HealthMetrics> {
    const debt = await this.getDebt(_client, _partyId);
    const collateralNum = parseFloat(this.collateral) || 0;
    const debtNum = parseFloat(debt.totalOwed) || 0;
    const healthFactor = debtNum > 0 ? (collateralNum / debtNum).toFixed(2) : "999.00";
    const maxBorrow = (collateralNum * 0.75).toFixed(2); // 75% LTV

    return {
      healthFactor,
      collateral: this.collateral,
      debt: debt.totalOwed,
      maxBorrow,
      liquidationThreshold: "0.80",
      rate: "7.83",
    };
  }

  async getDebt(_client: CantonClient, _partyId: string): Promise<DebtInfo> {
    const interest = this.calcInterest();
    const totalOwed = addAmounts(this.borrowed, interest);
    return {
      borrowed: this.borrowed,
      interestAccrued: interest,
      totalOwed,
      rate: "7.83",
    };
  }

  private calcInterest(): string {
    if (this.borrowTimestamp === 0 || this.borrowed === "0") return "0";
    const elapsed = (Date.now() - this.borrowTimestamp) / (365.25 * 24 * 3600 * 1000);
    const principal = parseFloat(this.borrowed);
    const interest = principal * 0.0783 * elapsed;
    return interest > 0.000001 ? interest.toFixed(6) : "0";
  }

  /** For testing: inject state. */
  _setCollateral(amount: string): void { this.collateral = amount; }
  _setBorrowed(amount: string, timestamp?: number): void {
    this.borrowed = amount;
    this.borrowTimestamp = timestamp ?? Date.now();
  }
}
