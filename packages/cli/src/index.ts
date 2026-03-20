/**
 * @caypo/canton-cli — CLI for Canton Network agent.
 * Binary: caypo (aliases: canton-agent, ca)
 */

import { Command } from "commander";

import { initCommand } from "./commands/init.js";
import { balanceCommand } from "./commands/balance.js";
import { sendCommand } from "./commands/send.js";
import { payCommand } from "./commands/pay.js";
import { addressCommand } from "./commands/address.js";
import { safeguardsCommand } from "./commands/safeguards.js";
import { trafficCommand } from "./commands/traffic.js";
import { mcpCommand } from "./commands/mcp.js";
import { saveCommand, withdrawCommand, rebalanceCommand, earningsCommand } from "./commands/savings.js";
import { borrowCommand, repayCommand, healthCommand } from "./commands/credit.js";
import { exchangeCommand, ratesCommand } from "./commands/exchange.js";
import { investCommand, portfolioCommand, positionsCommand } from "./commands/invest.js";
import { claimRewardsCommand } from "./commands/rewards.js";

export const CANTON_CLI_VERSION = "0.2.0";

const program = new Command();

program
  .name("caypo")
  .description("CAYPO — Agent finance on institutional rails")
  .version(CANTON_CLI_VERSION, "-v, --version")
  // Setup
  .addCommand(initCommand)
  .addCommand(balanceCommand)
  .addCommand(addressCommand)
  // Checking
  .addCommand(sendCommand)
  .addCommand(payCommand)
  // Savings
  .addCommand(saveCommand)
  .addCommand(withdrawCommand)
  .addCommand(rebalanceCommand)
  .addCommand(earningsCommand)
  // Credit
  .addCommand(borrowCommand)
  .addCommand(repayCommand)
  .addCommand(healthCommand)
  // Exchange
  .addCommand(exchangeCommand)
  .addCommand(ratesCommand)
  // Investment
  .addCommand(investCommand)
  .addCommand(portfolioCommand)
  .addCommand(positionsCommand)
  // Rewards
  .addCommand(claimRewardsCommand)
  // System
  .addCommand(safeguardsCommand)
  .addCommand(trafficCommand)
  .addCommand(mcpCommand);

program.parse(process.argv);
