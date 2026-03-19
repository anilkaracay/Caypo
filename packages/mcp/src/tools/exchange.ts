/**
 * Exchange tools (2): caypo_exchange, caypo_quote
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function exchangeTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_exchange",
      description: "Swap between USDCx and CC (Canton Coin) with slippage protection.",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "Amount to swap" },
          from: { type: "string", enum: ["USDCx", "CC"], description: "Source token" },
          to: { type: "string", enum: ["USDCx", "CC"], description: "Destination token" },
          maxSlippage: { type: "string", description: "Max slippage percentage (default 1.0%)", default: "1.0" },
        },
        required: ["amount", "from", "to"],
      },
      handler: async (args) => {
        const { amount, from, to, maxSlippage } = args as { amount: string; from: string; to: string; maxSlippage?: string };
        const result = await agent.exchange.swap(amount, from, to, { maxSlippage });
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "swapped", ...result }, null, 2) }],
        };
      },
    },
    {
      name: "caypo_quote",
      description: "Get exchange rate quote for a token swap without executing.",
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "string", description: "Amount to quote" },
          from: { type: "string", enum: ["USDCx", "CC"], description: "Source token" },
          to: { type: "string", enum: ["USDCx", "CC"], description: "Destination token" },
        },
        required: ["amount", "from", "to"],
      },
      handler: async (args) => {
        const { amount, from, to } = args as { amount: string; from: string; to: string };
        const quote = await agent.exchange.quote(amount, from, to);
        return {
          content: [{ type: "text", text: JSON.stringify(quote, null, 2) }],
        };
      },
    },
  ];
}
