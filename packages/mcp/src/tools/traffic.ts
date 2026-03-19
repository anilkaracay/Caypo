/**
 * Traffic tools (2): caypo_traffic, caypo_purchase_traffic
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function trafficTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_traffic",
      description: "Check validator traffic balance. Canton uses traffic budgets, not gas fees.",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => {
        const bal = await agent.traffic.trafficBalance();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ...bal,
                note: "Canton uses traffic budgets per validator, not per-transaction gas fees.",
              }, null, 2),
            },
          ],
        };
      },
    },
    {
      name: "caypo_purchase_traffic",
      description: "Purchase additional traffic by burning Canton Coin (CC). Coming soon.",
      inputSchema: {
        type: "object",
        properties: {
          ccAmount: { type: "string", description: "Amount of CC to burn" },
        },
        required: ["ccAmount"],
      },
      handler: async () => ({
        content: [{ type: "text", text: "Traffic purchase is not yet implemented. Requires validator admin API access." }],
      }),
    },
  ];
}
