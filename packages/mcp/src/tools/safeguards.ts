/**
 * Safeguard tools (3): caypo_safeguards, caypo_set_limit, caypo_lock
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function safeguardTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_safeguards",
      description: "View current safeguard settings: tx limit, daily limit, lock status, daily spending",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => {
        const s = agent.safeguards.settings();
        return {
          content: [{ type: "text", text: JSON.stringify(s, null, 2) }],
        };
      },
    },
    {
      name: "caypo_set_limit",
      description: "Set per-transaction or daily spending limit",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["tx", "daily"], description: "Limit type" },
          amount: { type: "string", description: "Limit amount in USDCx" },
        },
        required: ["type", "amount"],
      },
      handler: async (args) => {
        const { type, amount } = args as { type: "tx" | "daily"; amount: string };
        if (type === "tx") {
          agent.safeguards.setTxLimit(amount);
        } else {
          agent.safeguards.setDailyLimit(amount);
        }
        return {
          content: [{ type: "text", text: `${type === "tx" ? "Per-transaction" : "Daily"} limit set to ${amount} USDCx` }],
        };
      },
    },
    {
      name: "caypo_lock",
      description: "Lock or unlock the wallet. When locked, all transactions are rejected.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["lock", "unlock"], description: "Action to perform" },
          pin: { type: "string", description: "PIN for lock/unlock" },
        },
        required: ["action"],
      },
      handler: async (args) => {
        const { action, pin } = args as { action: "lock" | "unlock"; pin?: string };
        if (action === "lock") {
          agent.safeguards.lock(pin);
          return { content: [{ type: "text", text: "Wallet locked. All transactions will be rejected until unlocked." }] };
        } else {
          agent.safeguards.unlock(pin ?? "");
          return { content: [{ type: "text", text: "Wallet unlocked." }] };
        }
      },
    },
  ];
}
