/**
 * Savings tools (4): caypo_save, caypo_withdraw, caypo_rebalance_savings, caypo_earnings
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function savingsTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_save",
      description: "Deposit USDCx into savings for yield. Returns deposit result with current APY.",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "Amount to deposit (or 'all' for entire checking balance)" },
        },
        required: ["amount"],
      },
      handler: async (args) => {
        const { amount } = args as { amount: string };
        const result = await agent.savings.deposit(amount);
        const balance = await agent.savings.balance();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "deposited",
              ...result,
              currentBalance: balance,
            }, null, 2),
          }],
        };
      },
    },
    {
      name: "caypo_withdraw",
      description: "Withdraw USDCx from savings back to checking account.",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "Amount to withdraw (or 'all')" },
        },
        required: ["amount"],
      },
      handler: async (args) => {
        const { amount } = args as { amount: string };
        const result = await agent.savings.withdraw(amount);
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "withdrawn", ...result }, null, 2) }],
        };
      },
    },
    {
      name: "caypo_rebalance_savings",
      description: "Compare yield protocols and move funds to the highest APY.",
      inputSchema: { type: "object", properties: {} },
      handler: async () => {
        const result = await agent.savings.rebalance();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "caypo_earnings",
      description: "View savings earnings across all yield protocols.",
      inputSchema: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["today", "week", "month", "all"], description: "Time period", default: "all" },
        },
      },
      handler: async () => {
        const earnings = await agent.savings.earnings();
        const balance = await agent.savings.balance();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ earnings, currentApy: balance.apy, deposited: balance.deposited }, null, 2),
          }],
        };
      },
    },
  ];
}
