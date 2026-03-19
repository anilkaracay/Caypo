/**
 * Savings commands: save, withdraw, rebalance, earnings
 */

import { Command } from "commander";
import ora from "ora";
import { banner, keyValue, successMessage, errorMessage, accent } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const saveCommand = new Command("save")
  .description("Deposit USDCx into savings for yield")
  .argument("<amount>", "Amount to deposit (or 'all')")
  .action(async (amount: string) => {
    banner();
    const spinner = ora(`Depositing ${amount} USDCx to savings...`).start();
    try {
      const agent = await loadAgent();
      const result = await agent.savings.deposit(amount);
      const bal = await agent.savings.balance();
      spinner.stop();
      successMessage(`Deposited ${accent(result.amount + " USDCx")} to savings`);
      keyValue("Protocol", `${bal.protocol} (${bal.apy}% APY)`);
      keyValue("Savings balance", accent(bal.total + " USDCx"));
      console.log("");
    } catch (err) {
      spinner.fail("Deposit failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

export const withdrawCommand = new Command("withdraw")
  .description("Withdraw USDCx from savings to checking")
  .argument("<amount>", "Amount to withdraw (or 'all')")
  .action(async (amount: string) => {
    banner();
    const spinner = ora(`Withdrawing ${amount} USDCx from savings...`).start();
    try {
      const agent = await loadAgent();
      const result = await agent.savings.withdraw(amount);
      spinner.stop();
      successMessage(`Withdrew ${accent(result.amount + " USDCx")} from savings`);
      if (result.earned !== "0") keyValue("Earned", accent(result.earned + " USDCx"));
      console.log("");
    } catch (err) {
      spinner.fail("Withdrawal failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

export const rebalanceCommand = new Command("rebalance")
  .description("Rebalance savings to highest APY protocol")
  .action(async () => {
    banner();
    const spinner = ora("Checking protocols...").start();
    try {
      const agent = await loadAgent();
      const result = await agent.savings.rebalance();
      spinner.stop();
      if (result.moved) {
        successMessage(`Moved funds from ${result.from} to ${accent(result.to!)} (${result.apy}% APY)`);
      } else {
        successMessage("Already on the best protocol. No rebalance needed.");
      }
      console.log("");
    } catch (err) {
      spinner.fail("Rebalance failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

export const earningsCommand = new Command("earnings")
  .description("View savings earnings")
  .action(async () => {
    banner();
    try {
      const agent = await loadAgent();
      const earnings = await agent.savings.earnings();
      const bal = await agent.savings.balance();
      keyValue("Total earned", accent(earnings.total + " USDCx"));
      keyValue("Current APY", bal.apy + "%");
      keyValue("Deposited", bal.deposited + " USDCx");
      for (const p of earnings.protocols) {
        keyValue(`  ${p.name}`, p.earned + " USDCx");
      }
      console.log("");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
