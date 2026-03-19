/**
 * Investment commands: invest buy/sell/earn/unearn/rebalance/strategy/auto, portfolio, positions
 */

import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { banner, keyValue, successMessage, errorMessage, accent, dim, line } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const investCommand = new Command("invest")
  .description("Investment account — buy, sell, strategies, DCA");

investCommand.command("buy")
  .argument("<amount>", "USDCx amount to spend")
  .argument("<asset>", "Asset to buy (CC or USDCx)")
  .description("Buy a Canton asset")
  .action(async (amount: string, asset: string) => {
    const spinner = ora(`Buying ${asset} with ${amount} USDCx...`).start();
    try {
      const agent = await loadAgent();
      const r = await agent.invest.buy(amount, asset);
      spinner.stop();
      successMessage(`Bought ${accent(r.received + " " + asset)}`);
    } catch (err) { spinner.fail((err as Error).message); process.exit(1); }
  });

investCommand.command("sell")
  .argument("<amount>", "Amount to sell (or 'all')")
  .argument("<asset>", "Asset to sell")
  .description("Sell an asset for USDCx")
  .action(async (amount: string, asset: string) => {
    const spinner = ora(`Selling ${amount} ${asset}...`).start();
    try {
      const agent = await loadAgent();
      const r = await agent.invest.sell(amount, asset);
      spinner.stop();
      successMessage(`Sold for ${accent(r.received + " USDCx")}`);
    } catch (err) { spinner.fail((err as Error).message); process.exit(1); }
  });

investCommand.command("earn")
  .argument("<asset>", "Asset to earn yield on")
  .description("Enable yield earning on an asset")
  .action(async (asset: string) => {
    const agent = await loadAgent();
    await agent.invest.earn(asset);
    successMessage(`Yield enabled for ${accent(asset)}`);
  });

investCommand.command("unearn")
  .argument("<asset>", "Asset to stop earning on")
  .description("Disable yield earning on an asset")
  .action(async (asset: string) => {
    const agent = await loadAgent();
    await agent.invest.unearn(asset);
    successMessage(`Yield disabled for ${accent(asset)}`);
  });

investCommand.command("rebalance")
  .description("Review portfolio and suggest rebalance")
  .action(async () => {
    const agent = await loadAgent();
    const p = await agent.invest.portfolio();
    console.log(chalk.gray("\n  Current portfolio:\n"));
    for (const pos of p.positions) {
      keyValue(pos.asset, `${pos.amount} (cost: ${pos.costBasis}, P&L: ${parseFloat(pos.pnl) >= 0 ? accent(pos.pnl) : chalk.red(pos.pnl)})`);
    }
    console.log(dim("\n  Use 'caypo invest strategy buy <name> <amount>' to rebalance.\n"));
  });

const strategyCmd = investCommand.command("strategy").description("Investment strategies");

strategyCmd.command("list")
  .description("List available strategies")
  .action(async () => {
    const agent = await loadAgent();
    const list = agent.invest.strategyList();
    console.log(chalk.gray("\n  Available Strategies\n"));
    for (const s of list) {
      const allocs = s.allocations.map((a) => `${a.asset}:${a.weight}%`).join(", ");
      keyValue(s.name, allocs);
    }
    console.log("");
  });

strategyCmd.command("buy")
  .argument("<name>", "Strategy name")
  .argument("<amount>", "Total USDCx to invest")
  .description("Buy according to strategy allocations")
  .action(async (name: string, amount: string) => {
    const spinner = ora(`Executing ${name} strategy with ${amount} USDCx...`).start();
    try {
      const agent = await loadAgent();
      const results = await agent.invest.strategyBuy(name, amount);
      spinner.stop();
      successMessage(`Strategy ${accent(name)} executed`);
      for (const r of results) keyValue(r.asset, r.amount + " USDCx");
      console.log("");
    } catch (err) { spinner.fail((err as Error).message); process.exit(1); }
  });

const autoCmd = investCommand.command("auto").description("Auto-invest (DCA)");

autoCmd.command("setup")
  .argument("<amount>", "DCA amount per run")
  .argument("<frequency>", "daily | weekly | monthly")
  .argument("<strategy>", "Strategy name")
  .description("Configure DCA auto-invest")
  .action(async (amount: string, frequency: string, strategy: string) => {
    const agent = await loadAgent();
    const config = agent.invest.autoSetup(amount, frequency as "daily" | "weekly" | "monthly", strategy);
    successMessage("DCA configured");
    keyValue("Amount", config.amount + " USDCx");
    keyValue("Frequency", config.frequency);
    keyValue("Strategy", config.strategy);
    console.log("");
  });

autoCmd.command("run")
  .description("Execute one DCA run")
  .action(async () => {
    const spinner = ora("Running DCA...").start();
    try {
      const agent = await loadAgent();
      const results = await agent.invest.autoRun();
      spinner.stop();
      if (results) {
        successMessage("DCA executed");
        for (const r of results) keyValue(r.asset, r.amount + " USDCx");
      } else {
        console.log(dim("  No auto-invest configured. Use 'caypo invest auto setup'."));
      }
      console.log("");
    } catch (err) { spinner.fail((err as Error).message); process.exit(1); }
  });

autoCmd.command("status")
  .description("Show DCA status")
  .action(async () => {
    const agent = await loadAgent();
    const status = agent.invest.autoStatus();
    if (status) {
      keyValue("Strategy", status.strategy);
      keyValue("Amount", status.amount + " USDCx");
      keyValue("Frequency", status.frequency);
      keyValue("Enabled", status.enabled ? accent("yes") : "no");
      if (status.lastRun) keyValue("Last run", status.lastRun);
    } else {
      console.log(dim("  No auto-invest configured."));
    }
    console.log("");
  });

export const portfolioCommand = new Command("portfolio")
  .description("Show investment portfolio with P&L")
  .action(async () => {
    banner();
    try {
      const agent = await loadAgent();
      const p = await agent.invest.portfolio();
      if (p.positions.length === 0) {
        console.log(dim("  No investment positions. Use 'caypo invest buy'."));
      } else {
        console.log(chalk.gray("  Investment Portfolio\n"));
        for (const pos of p.positions) {
          const pnlColor = parseFloat(pos.pnl) >= 0 ? accent : chalk.red;
          keyValue(pos.asset, `${pos.amount} | Value: ${pos.currentValue} | P&L: ${pnlColor(pos.pnl)} (${pos.pnlPercent}%)`);
        }
        line();
        keyValue("Total value", accent(p.totalValue));
        keyValue("Total P&L", (parseFloat(p.totalPnl) >= 0 ? accent : chalk.red)(p.totalPnl) + ` (${p.totalPnlPercent}%)`);
      }
      console.log("");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

export const positionsCommand = new Command("positions")
  .description("Show all DeFi positions across accounts")
  .action(async () => {
    banner();
    try {
      const agent = await loadAgent();
      const positions = await agent.savings.positions();
      const portfolio = await agent.invest.portfolio();
      if (positions.length === 0 && portfolio.positions.length === 0) {
        console.log(dim("  No DeFi positions."));
      } else {
        if (positions.length > 0) {
          console.log(chalk.gray("  Savings Positions\n"));
          for (const p of positions) {
            keyValue(p.protocol, `${p.deposited} USDCx (${p.apy}% APY, earned: ${p.earned})`);
          }
        }
        if (portfolio.positions.length > 0) {
          console.log(chalk.gray("\n  Investment Positions\n"));
          for (const p of portfolio.positions) {
            keyValue(p.asset, `${p.amount} | Value: ${p.currentValue}`);
          }
        }
      }
      console.log("");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
