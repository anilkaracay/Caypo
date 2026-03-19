/**
 * caypo safeguards — View and manage safeguard settings.
 */

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { SafeguardManager } from "@caypo/canton-sdk";
import { banner, keyValue, successMessage, errorMessage, accent, warn } from "../helpers/format.js";

export const safeguardsCommand = new Command("safeguards")
  .description("View and manage safeguard settings")
  .action(async () => {
    banner();

    try {
      const mgr = await SafeguardManager.load();
      const s = mgr.settings();

      console.log(chalk.gray("  Safeguard Settings\n"));
      keyValue("Per-tx limit", accent(s.txLimit + " USDCx"));
      keyValue("Daily limit", accent(s.dailyLimit + " USDCx"));
      keyValue("Daily spent", s.dailySpent + " USDCx");
      keyValue("Locked", s.locked ? warn("YES") : "no");
      keyValue("Last reset", s.lastResetDate);
      console.log("");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

safeguardsCommand
  .command("set-tx-limit")
  .argument("<amount>", "Per-transaction limit in USDCx")
  .description("Set per-transaction spending limit")
  .action(async (amount: string) => {
    try {
      const mgr = await SafeguardManager.load();
      mgr.setTxLimit(amount);
      successMessage(`Per-transaction limit set to ${accent(amount + " USDCx")}`);
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

safeguardsCommand
  .command("set-daily-limit")
  .argument("<amount>", "Daily spending limit in USDCx")
  .description("Set daily spending limit")
  .action(async (amount: string) => {
    try {
      const mgr = await SafeguardManager.load();
      mgr.setDailyLimit(amount);
      successMessage(`Daily limit set to ${accent(amount + " USDCx")}`);
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

safeguardsCommand
  .command("lock")
  .description("Lock wallet — all transactions will be rejected")
  .action(async () => {
    try {
      const { pin } = await inquirer.prompt([
        {
          type: "password",
          name: "pin",
          message: "Set lock PIN:",
          mask: "*",
        },
      ]);

      const mgr = await SafeguardManager.load();
      mgr.lock(pin);
      successMessage("Wallet locked");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

safeguardsCommand
  .command("unlock")
  .description("Unlock wallet")
  .action(async () => {
    try {
      const { pin } = await inquirer.prompt([
        {
          type: "password",
          name: "pin",
          message: "Enter lock PIN:",
          mask: "*",
        },
      ]);

      const mgr = await SafeguardManager.load();
      mgr.unlock(pin);
      successMessage("Wallet unlocked");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
