/**
 * Checking tools (3): caypo_send, caypo_receive, caypo_contacts
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function checkingTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_send",
      description: "Send USDCx to a recipient via TransferFactory_Transfer. Checks safeguards before sending.",
      inputSchema: {
        type: "object",
        properties: {
          recipient: { type: "string", description: "Recipient Canton party ID" },
          amount: { type: "string", description: "Amount of USDCx to send (string, e.g. '1.50')" },
          memo: { type: "string", description: "Optional memo" },
        },
        required: ["recipient", "amount"],
      },
      handler: async (args) => {
        const { recipient, amount, memo } = args as { recipient: string; amount: string; memo?: string };
        const result = await agent.checking.send(recipient, amount, { memo });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "success",
                amount,
                recipient,
                updateId: result.updateId,
                completionOffset: result.completionOffset,
                commandId: result.commandId,
              }, null, 2),
            },
          ],
        };
      },
    },
    {
      name: "caypo_receive",
      description: "Show party ID and deposit instructions for receiving USDCx",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              partyId: agent.wallet.address,
              network: agent.wallet.network,
              instructions: "Send USDCx to this party ID. The sender needs a TransferPreapproval or must use a 2-step TransferInstruction.",
            }, null, 2),
          },
        ],
      }),
    },
    {
      name: "caypo_contacts",
      description: "Manage contact list — list, add, or remove contacts",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["list", "add", "remove"], default: "list" },
          name: { type: "string", description: "Contact name" },
          partyId: { type: "string", description: "Contact party ID" },
        },
      },
      handler: async () => ({
        content: [{ type: "text", text: "Contact management coming soon. Use party IDs directly for now." }],
      }),
    },
  ];
}
