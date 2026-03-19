/**
 * caypo traffic — Show validator traffic balance.
 */

import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { banner, keyValue, accent, warn } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const trafficCommand = new Command("traffic")
  .description("Show validator traffic balance")
  .action(async () => {
    banner();

    const spinner = ora("Checking traffic balance...").start();
    try {
      const agent = await loadAgent();
      const balance = await agent.traffic.trafficBalance();
      const sufficient = balance.remaining > 1000;
      spinner.stop();

      console.log(chalk.gray("  Validator Traffic\n"));
      keyValue("Total purchased", accent(String(balance.totalPurchased)));
      keyValue("Consumed", String(balance.consumed));
      keyValue("Remaining", sufficient ? accent(String(balance.remaining)) : warn(String(balance.remaining)));
      keyValue("Status", sufficient ? "Sufficient" : warn("Low — consider purchasing more"));
      console.log("");
    } catch (err) {
      spinner.fail(`Failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });

trafficCommand
  .command("purchase")
  .argument("<cc-amount>", "Canton Coin amount to burn for traffic")
  .description("Purchase additional traffic by burning CC")
  .action(async (ccAmount: string) => {
    const spinner = ora(`Purchasing traffic with ${ccAmount} CC...`).start();
    try {
      const agent = await loadAgent();
      await agent.traffic.purchaseTraffic(ccAmount);
      spinner.succeed("Traffic purchased");
    } catch (err) {
      spinner.fail(`Purchase failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
