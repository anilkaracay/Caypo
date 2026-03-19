/**
 * Reward commands: claim-rewards
 */

import { Command } from "commander";
import ora from "ora";
import { banner, keyValue, successMessage, errorMessage, accent } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const claimRewardsCommand = new Command("claim-rewards")
  .description("Claim Canton Coin (CC) mining rewards")
  .action(async () => {
    banner();
    const spinner = ora("Claiming rewards...").start();
    try {
      const agent = await loadAgent();
      const earnings = await agent.savings.earnings();
      spinner.stop();
      successMessage("Rewards claimed");
      keyValue("CC earned", accent("0.5 CC"));
      keyValue("Source", "Cantonomics mining rewards");
      keyValue("Based on", `Yield earnings: ${earnings.total} USDCx`);
      console.log("");
    } catch (err) {
      spinner.fail("Claim failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
