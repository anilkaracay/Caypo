/**
 * Exchange commands: exchange, rates
 */

import { Command } from "commander";
import ora from "ora";
import { banner, keyValue, successMessage, errorMessage, accent } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const exchangeCommand = new Command("exchange")
  .description("Swap between USDCx and CC")
  .argument("<amount>", "Amount to swap")
  .argument("<from>", "Source token (USDCx or CC)")
  .argument("<to>", "Destination token (USDCx or CC)")
  .option("--max-slippage <pct>", "Max slippage percentage", "1.0")
  .action(async (amount: string, from: string, to: string, opts: { maxSlippage: string }) => {
    banner();
    const spinner = ora(`Swapping ${amount} ${from} to ${to}...`).start();
    try {
      const agent = await loadAgent();
      const result = await agent.exchange.swap(amount, from, to, { maxSlippage: opts.maxSlippage });
      spinner.stop();
      successMessage(`Swapped ${accent(amount + " " + from)} for ${accent(result.outputAmount + " " + to)}`);
      keyValue("Rate", result.rate);
      keyValue("Fee", result.fee + " " + from);
      console.log("");
    } catch (err) {
      spinner.fail("Swap failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });

export const ratesCommand = new Command("rates")
  .description("Show current exchange rates")
  .action(async () => {
    banner();
    try {
      const agent = await loadAgent();
      const rates = await agent.exchange.rates();
      for (const r of rates) {
        keyValue(r.pair, `${accent(r.rate)} (${r.change24h}% 24h)`);
      }
      console.log("");
    } catch (err) {
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
