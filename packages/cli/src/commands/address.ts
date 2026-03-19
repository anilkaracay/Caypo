/**
 * caypo address — Show party ID.
 */

import { Command } from "commander";
import { banner, keyValue } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const addressCommand = new Command("address")
  .description("Show your Canton party ID (address)")
  .action(async () => {
    banner();

    try {
      const agent = await loadAgent();
      keyValue("Party ID", agent.wallet.address);
      keyValue("Network", agent.wallet.network);
      console.log("");
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });
