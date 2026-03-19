/**
 * Zod schemas for Canton MPP payment method.
 * Exported separately for reuse in validation, gateway middleware, etc.
 */

import { z } from "zod";

export const requestSchema = z.object({
  amount: z.string().regex(/^\d+\.?\d{0,10}$/, "Invalid amount format"),
  currency: z.enum(["USDCx", "CC"]),
  recipient: z.string().min(1, "Recipient party ID required"),
  network: z.enum(["mainnet", "testnet", "devnet"]),
  description: z.string().optional(),
  expiry: z.number().int().min(1).max(3600).default(300),
});

export const credentialPayloadSchema = z.object({
  updateId: z.string().min(1, "updateId required"),
  completionOffset: z.number().int(),
  sender: z.string().min(1, "Sender party ID required"),
  commandId: z.string().min(1, "commandId required"),
});

export const receiptSchema = z.object({
  method: z.literal("canton"),
  reference: z.string().min(1),
  status: z.enum(["success", "failed"]),
  timestamp: z.string(),
});

export type CantonRequest = z.infer<typeof requestSchema>;
export type CantonCredentialPayload = z.infer<typeof credentialPayloadSchema>;
export type CantonReceipt = z.infer<typeof receiptSchema>;
