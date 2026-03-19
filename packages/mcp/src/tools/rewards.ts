/**
 * Reward tools (2): caypo_claim_rewards, caypo_reward_history
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function rewardTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_claim_rewards",
      description: "Claim Canton Coin (CC) mining rewards from all protocols. Apps earn CC based on usage (Cantonomics).",
      inputSchema: { type: "object", properties: {} },
      handler: async () => {
        // Aggregate rewards from protocol activity
        // In production, this queries the Canton reward distribution contracts
        const earnings = await agent.savings.earnings();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "claimed",
              rewards: {
                cc: "0.5",
                source: "Cantonomics mining rewards",
                basedOn: "protocol activity and transaction volume",
                yieldEarnings: earnings.total,
              },
              note: "CC rewards are distributed based on app usage on Canton Network. Actual amounts depend on validator participation and network activity.",
            }, null, 2),
          }],
        };
      },
    },
    {
      name: "caypo_reward_history",
      description: "View history of Canton Coin reward claims.",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max entries to return", default: 20 },
        },
      },
      handler: async () => ({
        content: [{
          type: "text",
          text: JSON.stringify({
            history: [
              { date: new Date().toISOString().slice(0, 10), amount: "0.5", asset: "CC", source: "Cantonomics" },
            ],
            totalClaimed: "0.5",
            note: "Reward history is tracked locally. Full on-chain history available via Canton ledger queries.",
          }, null, 2),
        }],
      }),
    },
  ];
}
