/**
 * @caypo/mpp-canton — MPP payment method for Canton Network.
 * Uses CIP-56 TransferPreapproval for 1-step transfers.
 */

export const MPP_CANTON_VERSION = "0.1.0";

export interface CantonPaymentCredential {
  updateId: string;
  completionOffset: number;
  sender: string;
  commandId: string;
}

export interface CantonPaymentRequest {
  amount: string;
  currency: "USDCx" | "CC";
  recipient: string;
  network: "mainnet" | "testnet" | "devnet";
  description?: string;
  expiry?: number;
}
