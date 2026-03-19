/**
 * caypo init — Interactive wallet setup.
 */

import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import chalk from "chalk";
import {
  CantonClient,
  Keystore,
  saveConfig,
  DEFAULT_CONFIG,
  SafeguardManager,
  type AgentConfig,
} from "@caypo/canton-sdk";
import { banner, keyValue, successMessage, errorMessage, accent } from "../helpers/format.js";

export const initCommand = new Command("init")
  .description("Interactive wallet setup — create keystore, allocate party")
  .action(async () => {
    banner();
    console.log(chalk.gray("  Setting up your Canton agent wallet...\n"));

    try {
      // 1. Prompt for PIN
      const { pin } = await inquirer.prompt([
        {
          type: "password",
          name: "pin",
          message: "Choose a PIN for your wallet:",
          mask: "*",
          validate: (v: string) => v.length >= 4 || "PIN must be at least 4 characters",
        },
      ]);

      const { confirmPin } = await inquirer.prompt([
        {
          type: "password",
          name: "confirmPin",
          message: "Confirm PIN:",
          mask: "*",
          validate: (v: string) => v === pin || "PINs do not match",
        },
      ]);

      // 2. Prompt for ledger URL
      const { ledgerUrl } = await inquirer.prompt([
        {
          type: "input",
          name: "ledgerUrl",
          message: "Canton Ledger URL:",
          default: "http://localhost:7575",
        },
      ]);

      // 3. Prompt for JWT
      const { jwt } = await inquirer.prompt([
        {
          type: "password",
          name: "jwt",
          message: "JWT bearer token:",
          mask: "*",
          validate: (v: string) => v.length > 0 || "JWT is required",
        },
      ]);

      // 4. Prompt for user ID
      const { userId } = await inquirer.prompt([
        {
          type: "input",
          name: "userId",
          message: "Ledger API user ID:",
          default: "ledger-api-user",
        },
      ]);

      // 5. Prompt for display name (party hint)
      const { displayName } = await inquirer.prompt([
        {
          type: "input",
          name: "displayName",
          message: "Agent display name:",
          default: "Agent",
        },
      ]);

      // 6. Allocate party
      const spinner = ora("Allocating party on Canton ledger...").start();

      const client = new CantonClient({ ledgerUrl, token: jwt, userId });

      let partyId: string;
      try {
        const party = await client.allocateParty(displayName);
        partyId = party.party;
        spinner.succeed("Party allocated");
      } catch (err) {
        spinner.fail("Failed to allocate party");
        errorMessage((err as Error).message);
        process.exit(1);
      }

      // 7. Create keystore
      const keystoreSpinner = ora("Creating encrypted keystore...").start();
      await Keystore.create(pin, { partyId, jwt, userId });
      keystoreSpinner.succeed("Keystore created");

      // 8. Save config
      const config: AgentConfig = {
        ...DEFAULT_CONFIG,
        ledgerUrl,
        partyId,
        userId,
      };
      await saveConfig(config);

      // 9. Initialize safeguards
      const safeguards = new SafeguardManager();
      safeguards.setTxLimit(DEFAULT_CONFIG.safeguards.txLimit);
      safeguards.setDailyLimit(DEFAULT_CONFIG.safeguards.dailyLimit);

      // 10. Show success
      console.log("");
      successMessage("Canton agent wallet created successfully!");
      console.log("");
      keyValue("Party ID", accent(partyId));
      keyValue("Ledger URL", ledgerUrl);
      keyValue("Config", "~/.caypo/config.json");
      keyValue("Keystore", "~/.caypo/wallet.key");
      console.log("");
      console.log(chalk.gray("  Next steps:"));
      console.log(chalk.gray("    caypo balance        — Check your balance"));
      console.log(chalk.gray("    caypo mcp install    — Install MCP server for AI tools"));
      console.log(chalk.gray("    caypo send 1 to <party>  — Send USDCx"));
      console.log("");
    } catch (err) {
      errorMessage(`Setup failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
