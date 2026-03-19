/**
 * caypo balance — Show USDCx balance.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { banner, keyValue, accent } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const balanceCommand = new Command("balance")
  .description("Show USDCx checking balance")
  .action(async () => {
    banner();

    const spinner = ora("Fetching balance...").start();
    try {
      const agent = await loadAgent();
      const bal = await agent.checking.balance();
      spinner.stop();

      console.log(chalk.gray("  Checking Account\n"));
      keyValue("Balance", accent(`${bal.available} USDCx`));
      keyValue("Holdings", `${bal.holdingCount} UTXO${bal.holdingCount !== 1 ? "s" : ""}`);
      keyValue("Address", agent.wallet.address);
      keyValue("Network", agent.wallet.network);
      console.log("");
    } catch (err) {
      spinner.fail(`Failed to fetch balance: ${(err as Error).message}`);
      process.exit(1);
    }
  });
