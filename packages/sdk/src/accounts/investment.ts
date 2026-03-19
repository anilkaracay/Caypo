/**
 * InvestmentAccount — buy/sell Canton assets, strategies, DCA.
 */

import { addAmounts, subtractAmounts, compareAmounts } from "../canton/amount.js";
import type { ExchangeAccount } from "./exchange.js";

export interface CantonAsset {
  name: string;
  symbol: string;
  decimals: number;
}

export const CANTON_ASSETS: Record<string, CantonAsset> = {
  CC: { name: "Canton Coin", symbol: "CC", decimals: 10 },
  USDCx: { name: "USDCx Stablecoin", symbol: "USDCx", decimals: 6 },
};

export interface Allocation {
  asset: string;
  weight: number; // 0-100
}

export interface Strategy {
  name: string;
  allocations: Allocation[];
}

export const STRATEGIES: Strategy[] = [
  { name: "institutional", allocations: [{ asset: "CC", weight: 40 }, { asset: "USDCx", weight: 60 }] },
  { name: "cc-heavy", allocations: [{ asset: "CC", weight: 80 }, { asset: "USDCx", weight: 20 }] },
  { name: "stable-yield", allocations: [{ asset: "USDCx", weight: 100 }] },
  { name: "balanced", allocations: [{ asset: "CC", weight: 50 }, { asset: "USDCx", weight: 50 }] },
];

export interface Position {
  asset: string;
  amount: string;
  costBasis: string;
  currentValue: string;
  pnl: string;
  pnlPercent: string;
}

export interface AutoInvestConfig {
  strategy: string;
  amount: string;
  frequency: "daily" | "weekly" | "monthly";
  enabled: boolean;
  lastRun?: string;
}

export interface PortfolioSummary {
  positions: Position[];
  totalValue: string;
  totalCost: string;
  totalPnl: string;
  totalPnlPercent: string;
}

interface HoldingRecord {
  asset: string;
  amount: string;
  costBasis: string;
}

export class InvestmentAccount {
  private holdings: Map<string, HoldingRecord> = new Map();
  private autoConfig: AutoInvestConfig | null = null;
  private customStrategies: Strategy[] = [];

  constructor(
    private readonly exchange: ExchangeAccount,
  ) {}

  /** Buy an asset using USDCx. */
  async buy(amount: string, asset: string): Promise<{ txId: string; received: string }> {
    if (asset === "USDCx") {
      // Just record the position directly
      this.addHolding(asset, amount, amount);
      return { txId: `buy-${Date.now()}`, received: amount };
    }

    const result = await this.exchange.swap(amount, "USDCx", asset);
    this.addHolding(asset, result.outputAmount, amount);
    return { txId: result.txId, received: result.outputAmount };
  }

  /** Sell an asset for USDCx. Use "all" to sell entire position. */
  async sell(amount: string, asset: string): Promise<{ txId: string; received: string }> {
    const holding = this.holdings.get(asset);
    if (!holding || compareAmounts(holding.amount, "0") <= 0) {
      throw new Error(`No ${asset} position to sell`);
    }

    const sellAmount = amount === "all" ? holding.amount : amount;

    if (compareAmounts(sellAmount, holding.amount) > 0) {
      throw new Error(`Insufficient ${asset}: have ${holding.amount}, selling ${sellAmount}`);
    }

    if (asset === "USDCx") {
      this.reduceHolding(asset, sellAmount);
      return { txId: `sell-${Date.now()}`, received: sellAmount };
    }

    const result = await this.exchange.swap(sellAmount, asset, "USDCx");
    this.reduceHolding(asset, sellAmount);
    return { txId: result.txId, received: result.outputAmount };
  }

  /** Toggle yield earning on an asset (placeholder). */
  async earn(asset: string): Promise<{ enabled: boolean; asset: string }> {
    return { enabled: true, asset };
  }

  /** Disable yield earning on an asset (placeholder). */
  async unearn(asset: string): Promise<{ enabled: boolean; asset: string }> {
    return { enabled: false, asset };
  }

  /** Get portfolio with P&L. */
  async portfolio(): Promise<PortfolioSummary> {
    const positions: Position[] = [];
    let totalValue = "0";
    let totalCost = "0";

    for (const [asset, holding] of this.holdings) {
      if (compareAmounts(holding.amount, "0") <= 0) continue;

      let currentValue: string;
      if (asset === "USDCx") {
        currentValue = holding.amount;
      } else {
        try {
          const quote = await this.exchange.quote(holding.amount, asset, "USDCx");
          currentValue = quote.outputAmount;
        } catch {
          currentValue = holding.costBasis; // fallback
        }
      }

      const pnlNum = parseFloat(currentValue) - parseFloat(holding.costBasis);
      const pnlPercent = parseFloat(holding.costBasis) > 0
        ? ((pnlNum / parseFloat(holding.costBasis)) * 100).toFixed(2)
        : "0";

      positions.push({
        asset,
        amount: holding.amount,
        costBasis: holding.costBasis,
        currentValue,
        pnl: pnlNum.toFixed(6),
        pnlPercent,
      });

      totalValue = addAmounts(totalValue, currentValue);
      totalCost = addAmounts(totalCost, holding.costBasis);
    }

    const totalPnlNum = parseFloat(totalValue) - parseFloat(totalCost);
    const totalPnlPercent = parseFloat(totalCost) > 0
      ? ((totalPnlNum / parseFloat(totalCost)) * 100).toFixed(2)
      : "0";

    return {
      positions,
      totalValue,
      totalCost,
      totalPnl: totalPnlNum.toFixed(6),
      totalPnlPercent,
    };
  }

  /** List available strategies (built-in + custom). */
  strategyList(): Strategy[] {
    return [...STRATEGIES, ...this.customStrategies];
  }

  /** Buy according to a strategy's allocations. */
  async strategyBuy(strategyName: string, totalAmount: string): Promise<Array<{ asset: string; amount: string }>> {
    const strategy = this.strategyList().find((s) => s.name === strategyName);
    if (!strategy) throw new Error(`Strategy not found: ${strategyName}`);

    const results: Array<{ asset: string; amount: string }> = [];
    for (const alloc of strategy.allocations) {
      const amount = (parseFloat(totalAmount) * alloc.weight / 100).toFixed(6);
      if (parseFloat(amount) > 0) {
        await this.buy(amount, alloc.asset);
        results.push({ asset: alloc.asset, amount });
      }
    }
    return results;
  }

  /** Create a custom strategy. */
  strategyCreate(name: string, allocations: Allocation[]): Strategy {
    const totalWeight = allocations.reduce((s, a) => s + a.weight, 0);
    if (totalWeight !== 100) throw new Error(`Allocations must sum to 100, got ${totalWeight}`);

    const strategy: Strategy = { name, allocations };
    this.customStrategies.push(strategy);
    return strategy;
  }

  /** Configure auto-invest (DCA). */
  autoSetup(amount: string, frequency: "daily" | "weekly" | "monthly", strategy: string): AutoInvestConfig {
    const strat = this.strategyList().find((s) => s.name === strategy);
    if (!strat) throw new Error(`Strategy not found: ${strategy}`);

    this.autoConfig = { strategy, amount, frequency, enabled: true };
    return this.autoConfig;
  }

  /** Execute one auto-invest run. */
  async autoRun(): Promise<Array<{ asset: string; amount: string }> | null> {
    if (!this.autoConfig?.enabled) return null;
    const result = await this.strategyBuy(this.autoConfig.strategy, this.autoConfig.amount);
    this.autoConfig.lastRun = new Date().toISOString();
    return result;
  }

  /** Get auto-invest status. */
  autoStatus(): AutoInvestConfig | null {
    return this.autoConfig ? { ...this.autoConfig } : null;
  }

  // --- Internal helpers ---

  private addHolding(asset: string, amount: string, cost: string): void {
    const existing = this.holdings.get(asset);
    if (existing) {
      existing.amount = addAmounts(existing.amount, amount);
      existing.costBasis = addAmounts(existing.costBasis, cost);
    } else {
      this.holdings.set(asset, { asset, amount, costBasis: cost });
    }
  }

  private reduceHolding(asset: string, amount: string): void {
    const existing = this.holdings.get(asset);
    if (!existing) return;
    const ratio = parseFloat(amount) / parseFloat(existing.amount);
    const costReduction = (parseFloat(existing.costBasis) * ratio).toFixed(6);
    existing.amount = subtractAmounts(existing.amount, amount);
    existing.costBasis = subtractAmounts(existing.costBasis, costReduction);
  }
}
