/**
 * Load CantonAgent from config for CLI commands.
 */

import { CantonAgent, loadConfig } from "@caypo/canton-sdk";
import { errorMessage } from "./format.js";

export async function loadAgent(): Promise<CantonAgent> {
  try {
    const config = await loadConfig();

    if (!config.partyId) {
      errorMessage("No wallet configured. Run 'caypo init' first.");
      process.exit(1);
    }

    return CantonAgent.create({
      ledgerUrl: config.ledgerUrl,
      partyId: config.partyId,
      userId: config.userId,
      network: config.network,
      token: process.env.CANTON_JWT ?? "",
    });
  } catch (err) {
    errorMessage(`Failed to load agent: ${(err as Error).message}`);
    process.exit(1);
  }
}
