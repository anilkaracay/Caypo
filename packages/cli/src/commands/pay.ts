/**
 * caypo pay <url> — Pay for API via MPP 402 flow.
 */

import { Command } from "commander";
import ora from "ora";
import { banner, keyValue, successMessage, errorMessage, accent, dim } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const payCommand = new Command("pay")
  .description("Pay for an API call via MPP (402 auto-pay)")
  .argument("<url>", "URL to fetch")
  .option("-d, --data <json>", "Request body (JSON)")
  .option("-X, --method <method>", "HTTP method", "GET")
  .option("--max-price <amount>", "Maximum price to pay")
  .action(async (url: string, opts: { data?: string; method: string; maxPrice?: string }) => {
    banner();

    const spinner = ora(`Fetching ${url}...`).start();
    try {
      const agent = await loadAgent();
      const result = await agent.mpp.pay(url, {
        method: opts.method,
        body: opts.data,
        maxPrice: opts.maxPrice,
        headers: opts.data ? { "Content-Type": "application/json" } : undefined,
      });

      spinner.stop();

      if (result.paid) {
        successMessage(`Paid ${accent(result.receipt!.amount + " USDCx")} for API access`);
        keyValue("Update ID", result.receipt!.updateId);
        keyValue("Command ID", result.receipt!.commandId);
      } else {
        console.log(dim("  No payment required (non-402 response)"));
      }

      keyValue("Status", String(result.response.status));

      const body = await result.response.text();
      if (body) {
        console.log(dim("\n  Response:"));
        console.log(dim("  " + body.slice(0, 500)));
        if (body.length > 500) console.log(dim("  ... (truncated)"));
      }
      console.log("");
    } catch (err) {
      spinner.fail("Payment failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
