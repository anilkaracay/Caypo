/**
 * CreditAccount — borrow USDCx against savings collateral.
 * Uses lending protocol adapter for pluggable integrations.
 */

import { compareAmounts } from "../canton/amount.js";
import type {
  LendingProtocol,
  BorrowResult,
  RepayResult,
  HealthMetrics,
  DebtInfo,
} from "../protocols/lending.js";

const MIN_HEALTH_FACTOR = "1.5";

export class CreditAccount {
  constructor(
    private readonly lending: LendingProtocol,
    private readonly partyId: string,
  ) {}

  /** Borrow USDCx. Refuses if health factor would drop below 1.5. */
  async borrow(amount: string): Promise<BorrowResult> {
    if (compareAmounts(amount, "0") <= 0) {
      throw new Error("Borrow amount must be > 0");
    }

    const health = await this.lending.getHealth(null as never, this.partyId);

    // Check if borrowing this amount would be safe
    const collateral = parseFloat(health.collateral);
    const currentDebt = parseFloat(health.debt);
    const newDebt = currentDebt + parseFloat(amount);
    const projectedHealth = newDebt > 0 ? collateral / newDebt : 999;

    if (projectedHealth < parseFloat(MIN_HEALTH_FACTOR)) {
      throw new Error(
        `Borrow rejected: health factor would drop to ${projectedHealth.toFixed(2)} (minimum ${MIN_HEALTH_FACTOR}). ` +
        `Collateral: ${health.collateral}, Current debt: ${health.debt}, Max additional borrow: ${health.maxBorrow}`,
      );
    }

    return this.lending.borrow(null as never, this.partyId, amount);
  }

  /** Repay borrowed amount. Use "all" to repay everything. */
  async repay(amount: string): Promise<RepayResult> {
    return this.lending.repay(null as never, this.partyId, amount);
  }

  /** Get health metrics: health factor, collateral, debt, limits. */
  async health(): Promise<HealthMetrics> {
    return this.lending.getHealth(null as never, this.partyId);
  }

  /** Get current debt info. */
  async balance(): Promise<DebtInfo> {
    return this.lending.getDebt(null as never, this.partyId);
  }
}
