/**
 * caypo balance — Show ALL account balances.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { banner, keyValue, accent, warn, line, dim } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";
import { addAmounts, subtractAmounts } from "@caypo/canton-sdk";

export const balanceCommand = new Command("balance")
  .description("Show all account balances")
  .action(async () => {
    banner();

    const spinner = ora("Fetching balances...").start();
    try {
      const agent = await loadAgent();

      const checking = await agent.checking.balance();
      const savings = await agent.savings.balance();
      const debt = await agent.credit.balance();
      const portfolio = await agent.invest.portfolio();
      const traffic = await agent.traffic.hasSufficientTraffic();

      spinner.stop();

      console.log(chalk.gray(`  CAYPO ${dim("·")} Canton ${agent.wallet.network}`));
      line();

      keyValue("Checking", accent(`${checking.available} USDCx`) + dim(`  (${checking.holdingCount} UTXOs)`));

      if (savings.deposited !== "0") {
        keyValue("Savings", accent(`${savings.total} USDCx`) + dim(`  (${savings.apy}% APY)`));
      }

      if (debt.totalOwed !== "0") {
        keyValue("Credit", warn(`-${debt.totalOwed} USDCx`) + dim(`  (${debt.rate}% rate)`));
      }

      if (portfolio.positions.length > 0) {
        const pnlStr = parseFloat(portfolio.totalPnl) >= 0
          ? `+${portfolio.totalPnlPercent}%`
          : `${portfolio.totalPnlPercent}%`;
        keyValue("Investment", accent(portfolio.totalValue) + dim(`  (${pnlStr})`));
      }

      keyValue("Traffic", traffic ? accent("OK") + dim("  (sufficient)") : warn("LOW") + dim("  (purchase needed)"));

      line();

      let net = checking.available;
      net = addAmounts(net, savings.total);
      if (portfolio.positions.length > 0) net = addAmounts(net, portfolio.totalValue);
      if (debt.totalOwed !== "0") net = subtractAmounts(net, debt.totalOwed);

      keyValue("Net Total", chalk.white.bold(`${net} USDCx`));
      console.log("");
    } catch (err) {
      spinner.fail(`Failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
