/**
 * caypo send <amount> to <recipient> — Send USDCx.
 */

import { Command } from "commander";
import ora from "ora";
import { banner, keyValue, successMessage, errorMessage, accent } from "../helpers/format.js";
import { loadAgent } from "../helpers/load-agent.js";

export const sendCommand = new Command("send")
  .description("Send USDCx to a recipient")
  .argument("<amount>", "Amount of USDCx to send")
  .argument("to", "Literal 'to' keyword")
  .argument("<recipient>", "Recipient party ID")
  .option("--memo <memo>", "Optional memo")
  .action(async (amount: string, _to: string, recipient: string, opts: { memo?: string }) => {
    banner();

    const spinner = ora(`Sending ${amount} USDCx to ${recipient}...`).start();
    try {
      const agent = await loadAgent();
      const result = await agent.checking.send(recipient, amount, { memo: opts.memo });
      spinner.stop();

      successMessage(`Sent ${accent(amount + " USDCx")} successfully!`);
      keyValue("Recipient", recipient);
      keyValue("Update ID", result.updateId);
      keyValue("Offset", String(result.completionOffset));
      keyValue("Command ID", result.commandId);
      console.log("");
    } catch (err) {
      spinner.fail("Transfer failed");
      errorMessage((err as Error).message);
      process.exit(1);
    }
  });
