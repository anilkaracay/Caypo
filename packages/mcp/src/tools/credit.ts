/**
 * Credit tools (3): caypo_borrow, caypo_repay, caypo_health
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function creditTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_borrow",
      description: "Borrow USDCx against savings collateral. Checks health factor (minimum 1.5).",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "Amount of USDCx to borrow" },
        },
        required: ["amount"],
      },
      handler: async (args) => {
        const { amount } = args as { amount: string };
        const result = await agent.credit.borrow(amount);
        const health = await agent.credit.health();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ status: "borrowed", ...result, healthAfter: health }, null, 2),
          }],
        };
      },
    },
    {
      name: "caypo_repay",
      description: "Repay borrowed USDCx with accrued interest. Use 'all' to repay everything.",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "Amount to repay (or 'all')" },
        },
        required: ["amount"],
      },
      handler: async (args) => {
        const { amount } = args as { amount: string };
        const result = await agent.credit.repay(amount);
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "repaid", ...result }, null, 2) }],
        };
      },
    },
    {
      name: "caypo_health",
      description: "Check credit health: health factor, collateral, debt, max borrow, liquidation threshold.",
      inputSchema: { type: "object", properties: {} },
      handler: async () => {
        const health = await agent.credit.health();
        const debt = await agent.credit.balance();
        return {
          content: [{ type: "text", text: JSON.stringify({ health, debt }, null, 2) }],
        };
      },
    },
  ];
}
