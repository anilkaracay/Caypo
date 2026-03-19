/**
 * Credit commands: borrow, repay, health
 */

import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { banner, keyValue, successMessage, errorMessage, accent, warn } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const borrowCommand = new Command("borrow")
  .description("Borrow USDCx against savings collateral")
  .argument("<amount>", "Amount to borrow")
  .action(async (amount: string) => {
    banner();
    const spinner = ora(`Borrowing ${amount} USDCx...`).start();
    try {
      const agent = await loadAgent();
      const result = await agent.credit.borrow(amount);
      const health = await agent.credit.health();
      spinner.stop();
      successMessage(`Borrowed ${accent(result.amount + " USDCx")}`);
      keyValue("Rate", result.rate + "% APR");
      keyValue("Health factor", parseFloat(health.healthFactor) > 2 ? accent(health.healthFactor) : warn(health.healthFactor));
      console.log("");
    } catch (err) {
      spinner.fail("Borrow failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

export const repayCommand = new Command("repay")
  .description("Repay borrowed USDCx")
  .argument("<amount>", "Amount to repay (or 'all')")
  .action(async (amount: string) => {
    banner();
    const spinner = ora(`Repaying ${amount} USDCx...`).start();
    try {
      const agent = await loadAgent();
      const result = await agent.credit.repay(amount);
      spinner.stop();
      successMessage(`Repaid ${accent(result.amount + " USDCx")}`);
      if (result.interestPaid !== "0") keyValue("Interest paid", result.interestPaid + " USDCx");
      keyValue("Remaining debt", result.remainingDebt + " USDCx");
      console.log("");
    } catch (err) {
      spinner.fail("Repay failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

export const healthCommand = new Command("health")
  .description("Check credit health factor and limits")
  .action(async () => {
    banner();
    try {
      const agent = await loadAgent();
      const h = await agent.credit.health();
      const d = await agent.credit.balance();
      console.log(chalk.gray("  Credit Health\n"));
      const hf = parseFloat(h.healthFactor);
      keyValue("Health factor", hf > 2 ? accent(h.healthFactor) : hf > 1.5 ? warn(h.healthFactor) : chalk.red.bold(h.healthFactor));
      keyValue("Collateral", h.collateral + " USDCx");
      keyValue("Debt", d.totalOwed + " USDCx");
      keyValue("Max borrow", h.maxBorrow + " USDCx");
      keyValue("Rate", h.rate + "% APR");
      keyValue("Liquidation at", h.liquidationThreshold);
      console.log("");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
