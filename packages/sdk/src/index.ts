/**
 * @caypo/canton-sdk — Core SDK for Canton Network.
 * JSON Ledger API v2 client, USDCx operations, agent accounts.
 */

export { MPP_CANTON_VERSION } from "@caypo/mpp-canton";

export const CANTON_SDK_VERSION = "0.1.0";

export const DEFAULT_LEDGER_PORT = 7575;

export interface CantonClientConfig {
  ledgerUrl: string;
  token: string;
  userId: string;
  partyId: string;
  network: "mainnet" | "testnet" | "devnet";
}
