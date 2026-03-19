/**
 * TrafficManager — Canton traffic budget management.
 *
 * Canton does NOT have per-transaction gas fees. Instead, each validator
 * has a traffic budget (bandwidth allocation). Additional traffic can be
 * purchased by burning Canton Coin (CC).
 *
 * NOTE: The actual traffic API depends on the validator/participant setup.
 * This provides the interface with a reasonable stub implementation.
 * Real implementation requires validator admin API access.
 */

import type { CantonClient } from "../canton/client.js";

export interface TrafficBalance {
  totalPurchased: number;
  consumed: number;
  remaining: number;
}

export interface AutoPurchaseConfig {
  enabled: boolean;
  minBalance: number;
  purchaseAmount: string;
}

export class TrafficManager {
  private autoPurchaseConfig: AutoPurchaseConfig = {
    enabled: false,
    minBalance: 1000,
    purchaseAmount: "5.0",
  };

  constructor(
    private readonly client: CantonClient,
    private readonly partyId: string,
  ) {}

  /**
   * Check validator's traffic balance.
   *
   * TODO: Implement using actual validator admin API.
   * The traffic balance is a validator-level concept, not per-party.
   * For now, returns a stub indicating sufficient traffic.
   */
  async trafficBalance(): Promise<TrafficBalance> {
    // Verify we can reach the ledger (health check as proxy)
    const healthy = await this.client.isHealthy();

    if (!healthy) {
      return { totalPurchased: 0, consumed: 0, remaining: 0 };
    }

    // TODO: Query actual traffic balance from validator admin API
    // The endpoint varies by validator implementation:
    // - Splice: GET /v0/admin/participant/traffic-state
    // - Direct Canton: participant admin gRPC
    return {
      totalPurchased: 10_000_000,
      consumed: 0,
      remaining: 10_000_000,
    };
  }

  /**
   * Purchase additional traffic by burning Canton Coin (CC).
   *
   * TODO: Implement using actual CC burn mechanism.
   */
  async purchaseTraffic(ccAmount: string): Promise<{ txId: string }> {
    void ccAmount;
    // TODO: Exercise the traffic purchase choice on the validator
    // This involves burning CC tokens to increase the validator's traffic budget.
    throw new Error("Traffic purchase not yet implemented — requires validator admin API");
  }

  /**
   * Check if there's sufficient traffic for a standard operation.
   * Returns true if remaining traffic > minimum threshold.
   */
  async hasSufficientTraffic(): Promise<boolean> {
    const balance = await this.trafficBalance();
    return balance.remaining > this.autoPurchaseConfig.minBalance;
  }

  /** Configure auto-purchase settings. */
  setAutoPurchase(config: AutoPurchaseConfig): void {
    this.autoPurchaseConfig = { ...config };
  }

  /** Get current auto-purchase configuration. */
  getAutoPurchaseConfig(): AutoPurchaseConfig {
    return { ...this.autoPurchaseConfig };
  }
}
