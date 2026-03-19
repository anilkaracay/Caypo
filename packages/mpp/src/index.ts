/**
 * @caypo/mpp-canton — MPP payment method for Canton Network.
 * Uses CIP-56 TransferPreapproval for 1-step transfers.
 */

export const MPP_CANTON_VERSION = "0.1.0";

// Method definition
export { cantonMethod } from "./method.js";

// Schemas for reuse
export {
  credentialPayloadSchema,
  receiptSchema,
  requestSchema,
} from "./schemas.js";
export type {
  CantonCredentialPayload,
  CantonReceipt,
  CantonRequest,
} from "./schemas.js";

// Client (agent side)
export { cantonClient } from "./client.js";
export type { CantonMppClientConfig } from "./client.js";

// Server (gateway side)
export { cantonServer, MppVerificationError } from "./server.js";
export type { CantonMppServerConfig } from "./server.js";
