/**
 * Balance & Info tools (5): caypo_balance, caypo_address, caypo_history, caypo_positions, caypo_rates
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function balanceTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_balance",
      description: "Get USDCx checking account balance and holding count",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => {
        const bal = await agent.checking.balance();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                available: bal.available,
                holdingCount: bal.holdingCount,
                currency: "USDCx",
                network: agent.wallet.network,
              }, null, 2),
            },
          ],
        };
      },
    },
    {
      name: "caypo_address",
      description: "Get Canton party ID (address) and network info",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              partyId: agent.wallet.address,
              network: agent.wallet.network,
              format: "<DisplayName>::<hex-fingerprint>",
            }, null, 2),
          },
        ],
      }),
    },
    {
      name: "caypo_history",
      description: "Get recent transaction history",
      inputSchema: {
        type: "object",
        properties: { limit: { type: "number", description: "Max transactions to return", default: 20 } },
      },
      handler: async (args) => {
        const history = await agent.checking.history({ limit: (args as { limit?: number }).limit });
        return {
          content: [{ type: "text", text: JSON.stringify(history, null, 2) }],
        };
      },
    },
    {
      name: "caypo_positions",
      description: "View DeFi positions (Coming in Phase 3)",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => ({
        content: [{ type: "text", text: "DeFi positions are not yet available. Coming in Phase 3 when Canton DeFi protocols launch." }],
      }),
    },
    {
      name: "caypo_rates",
      description: "Get exchange rates and APYs (Coming in Phase 3)",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => ({
        content: [{ type: "text", text: "Exchange rates and APYs are not yet available. Coming in Phase 3." }],
      }),
    },
  ];
}
