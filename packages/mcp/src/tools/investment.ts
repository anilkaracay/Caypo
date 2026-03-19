/**
 * Investment tools (8): buy, sell, earn, unearn, rebalance, portfolio, strategy, auto
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function investmentTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_invest_buy",
      description: "Buy a Canton asset (CC or USDCx) using USDCx.",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "USDCx amount to spend" },
          asset: { type: "string", enum: ["CC", "USDCx"], description: "Asset to buy" },
        },
        required: ["amount", "asset"],
      },
      handler: async (args) => {
        const { amount, asset } = args as { amount: string; asset: string };
        const result = await agent.invest.buy(amount, asset);
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "bought", ...result }, null, 2) }],
        };
      },
    },
    {
      name: "caypo_invest_sell",
      description: "Sell a Canton asset for USDCx. Use 'all' to sell entire position.",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "Amount to sell (or 'all')" },
          asset: { type: "string", enum: ["CC", "USDCx"], description: "Asset to sell" },
        },
        required: ["amount", "asset"],
      },
      handler: async (args) => {
        const { amount, asset } = args as { amount: string; asset: string };
        const result = await agent.invest.sell(amount, asset);
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "sold", ...result }, null, 2) }],
        };
      },
    },
    {
      name: "caypo_invest_earn",
      description: "Enable yield earning on a held asset.",
      inputSchema: {
        type: "object",
        properties: { asset: { type: "string", description: "Asset to earn on" } },
        required: ["asset"],
      },
      handler: async (args) => {
        const result = await agent.invest.earn((args as { asset: string }).asset);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    },
    {
      name: "caypo_invest_unearn",
      description: "Disable yield earning on a held asset.",
      inputSchema: {
        type: "object",
        properties: { asset: { type: "string", description: "Asset to stop earning on" } },
        required: ["asset"],
      },
      handler: async (args) => {
        const result = await agent.invest.unearn((args as { asset: string }).asset);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    },
    {
      name: "caypo_invest_rebalance",
      description: "Rebalance investment portfolio to match target allocations.",
      inputSchema: { type: "object", properties: {} },
      handler: async () => {
        const portfolio = await agent.invest.portfolio();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ message: "Review portfolio and use strategy_buy to rebalance", portfolio }, null, 2),
          }],
        };
      },
    },
    {
      name: "caypo_portfolio",
      description: "View investment portfolio with positions, P&L, and total value.",
      inputSchema: { type: "object", properties: {} },
      handler: async () => {
        const portfolio = await agent.invest.portfolio();
        return { content: [{ type: "text", text: JSON.stringify(portfolio, null, 2) }] };
      },
    },
    {
      name: "caypo_strategy_buy",
      description: "Buy according to a named investment strategy (institutional, balanced, cc-heavy, stable-yield).",
      inputSchema: {
        type: "object",
        properties: {
          strategy: { type: "string", description: "Strategy name" },
          amount: { type: "string", description: "Total USDCx to invest" },
        },
        required: ["strategy", "amount"],
      },
      handler: async (args) => {
        const { strategy, amount } = args as { strategy: string; amount: string };
        const results = await agent.invest.strategyBuy(strategy, amount);
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "executed", strategy, results }, null, 2) }],
        };
      },
    },
    {
      name: "caypo_auto_invest",
      description: "Configure, run, or check status of auto-invest (DCA).",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["setup", "run", "status", "cancel"], description: "Action to perform" },
          amount: { type: "string", description: "DCA amount (for setup)" },
          frequency: { type: "string", enum: ["daily", "weekly", "monthly"], description: "DCA frequency (for setup)" },
          strategy: { type: "string", description: "Strategy name (for setup)" },
        },
        required: ["action"],
      },
      handler: async (args) => {
        const { action, amount, frequency, strategy } = args as {
          action: string; amount?: string; frequency?: string; strategy?: string;
        };

        if (action === "setup") {
          if (!amount || !frequency || !strategy) {
            return { content: [{ type: "text", text: "Setup requires amount, frequency, and strategy" }], isError: true };
          }
          const config = agent.invest.autoSetup(amount, frequency as "daily" | "weekly" | "monthly", strategy);
          return { content: [{ type: "text", text: JSON.stringify({ status: "configured", config }, null, 2) }] };
        }

        if (action === "run") {
          const results = await agent.invest.autoRun();
          return { content: [{ type: "text", text: JSON.stringify({ status: results ? "executed" : "not configured", results }, null, 2) }] };
        }

        if (action === "status") {
          const status = agent.invest.autoStatus();
          return { content: [{ type: "text", text: JSON.stringify(status ?? { message: "No auto-invest configured" }, null, 2) }] };
        }

        return { content: [{ type: "text", text: `Unknown action: ${action}` }], isError: true };
      },
    },
  ];
}
