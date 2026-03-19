/**
 * Stub tools for Phase 3/4 features.
 * savings (4), credit (3), exchange (2), investment (8), rewards (2) = 19 stubs
 */

import type { ToolDef } from "./types.js";

function stub(name: string, description: string, phase: string): ToolDef {
  return {
    name,
    description: `${description} (Coming in ${phase})`,
    inputSchema: { type: "object", properties: {} },
    handler: async () => ({
      content: [{ type: "text", text: `${description} is not yet available. Coming in ${phase} when Canton DeFi protocols launch.` }],
    }),
  };
}

export function stubTools(): ToolDef[] {
  return [
    // Savings (4)
    stub("caypo_save", "Deposit USDCx into savings for yield", "Phase 3"),
    stub("caypo_withdraw", "Withdraw from savings to checking", "Phase 3"),
    stub("caypo_rebalance_savings", "Rebalance savings across protocols", "Phase 3"),
    stub("caypo_earnings", "View savings earnings and APY", "Phase 3"),
    // Credit (3)
    stub("caypo_borrow", "Borrow USDCx against collateral", "Phase 3"),
    stub("caypo_repay", "Repay borrowed amount", "Phase 3"),
    stub("caypo_health", "Check credit health factor", "Phase 3"),
    // Exchange (2)
    stub("caypo_exchange", "Exchange tokens on Canton DEX", "Phase 3"),
    stub("caypo_quote", "Get exchange rate quote", "Phase 3"),
    // Investment (8)
    stub("caypo_invest_buy", "Buy investment assets", "Phase 4"),
    stub("caypo_invest_sell", "Sell investment assets", "Phase 4"),
    stub("caypo_invest_earn", "Stake assets for yield", "Phase 4"),
    stub("caypo_invest_unearn", "Unstake assets", "Phase 4"),
    stub("caypo_invest_rebalance", "Rebalance investment portfolio", "Phase 4"),
    stub("caypo_portfolio", "View investment portfolio", "Phase 4"),
    stub("caypo_strategy_buy", "Execute investment strategy", "Phase 4"),
    stub("caypo_auto_invest", "Configure auto-invest DCA", "Phase 4"),
    // Rewards (2)
    stub("caypo_claim_rewards", "Claim Canton Coin mining rewards", "Phase 3"),
    stub("caypo_reward_history", "View reward claim history", "Phase 3"),
  ];
}
