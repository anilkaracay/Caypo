/**
 * @caypo/canton-cli — CLI for Canton Network agent.
 * Binary: caypo (aliases: canton-agent, ca)
 */

import { Command } from "commander";
import { CANTON_SDK_VERSION } from "@caypo/canton-sdk";

import { initCommand } from "./commands/init.js";
import { balanceCommand } from "./commands/balance.js";
import { sendCommand } from "./commands/send.js";
import { payCommand } from "./commands/pay.js";
import { addressCommand } from "./commands/address.js";
import { safeguardsCommand } from "./commands/safeguards.js";
import { trafficCommand } from "./commands/traffic.js";
import { mcpCommand } from "./commands/mcp.js";

export const CANTON_CLI_VERSION = "0.1.0";

const program = new Command();

program
  .name("caypo")
  .description("CAYPO — A bank account for AI agents on Canton Network")
  .version(CANTON_CLI_VERSION, "-v, --version")
  .addCommand(initCommand)
  .addCommand(balanceCommand)
  .addCommand(sendCommand)
  .addCommand(payCommand)
  .addCommand(addressCommand)
  .addCommand(safeguardsCommand)
  .addCommand(trafficCommand)
  .addCommand(mcpCommand);

program.parse(process.argv);
