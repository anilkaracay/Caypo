/**
 * caypo mcp install — Install MCP server config for AI tools.
 */

import { Command } from "commander";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir, platform } from "node:os";
import chalk from "chalk";
import { successMessage, errorMessage, keyValue, dim } from "../helpers/format.js";

interface McpConfig {
  mcpServers: Record<string, { command: string; args: string[]; env?: Record<string, string> }>;
}

const MCP_ENTRY = {
  command: "npx",
  args: ["@caypo/canton-mcp"],
  env: { CANTON_AGENT_CONFIG: join(homedir(), ".caypo", "config.json") },
};

function getConfigPaths(): { name: string; path: string }[] {
  const home = homedir();
  const os = platform();

  const paths: { name: string; path: string }[] = [];

  if (os === "darwin") {
    paths.push(
      { name: "Claude Desktop", path: join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json") },
      { name: "Cursor", path: join(home, ".cursor", "mcp.json") },
      { name: "Windsurf", path: join(home, ".windsurf", "mcp.json") },
    );
  } else if (os === "linux") {
    paths.push(
      { name: "Claude Desktop", path: join(home, ".config", "Claude", "claude_desktop_config.json") },
      { name: "Cursor", path: join(home, ".cursor", "mcp.json") },
      { name: "Windsurf", path: join(home, ".windsurf", "mcp.json") },
    );
  } else {
    // Windows
    const appData = process.env.APPDATA ?? join(home, "AppData", "Roaming");
    paths.push(
      { name: "Claude Desktop", path: join(appData, "Claude", "claude_desktop_config.json") },
      { name: "Cursor", path: join(home, ".cursor", "mcp.json") },
      { name: "Windsurf", path: join(home, ".windsurf", "mcp.json") },
    );
  }

  return paths;
}

async function installToConfig(configPath: string): Promise<boolean> {
  let config: McpConfig;

  try {
    const raw = await readFile(configPath, "utf8");
    config = JSON.parse(raw) as McpConfig;
  } catch {
    config = { mcpServers: {} };
  }

  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  config.mcpServers["caypo"] = MCP_ENTRY;

  await mkdir(join(configPath, ".."), { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  return true;
}

export const mcpCommand = new Command("mcp").description("MCP server management");

mcpCommand
  .command("install")
  .description("Install MCP server config for Claude Desktop, Cursor, Windsurf")
  .action(async () => {
    console.log(chalk.gray("\n  Installing CAYPO MCP server configuration...\n"));

    const configs = getConfigPaths();
    let installed = 0;

    for (const { name, path } of configs) {
      try {
        await installToConfig(path);
        console.log(`  ${chalk.green("✓")} ${name} ${dim(path)}`);
        installed++;
      } catch (err) {
        console.log(`  ${chalk.yellow("⚠")} ${name} — ${dim((err as Error).message)}`);
      }
    }

    if (installed > 0) {
      successMessage(`MCP server installed for ${installed} tool${installed > 1 ? "s" : ""}`);
      console.log(chalk.gray("  Restart your AI tool to activate the MCP server."));
      console.log(chalk.gray("  The server provides 33 tools and 20 prompts for Canton banking.\n"));
    } else {
      errorMessage("No AI tool configs found. Install manually.");
      console.log(chalk.gray("  Add this to your MCP config:\n"));
      console.log(chalk.gray("  " + JSON.stringify({ caypo: MCP_ENTRY }, null, 2).replace(/\n/g, "\n  ")));
      console.log("");
    }
  });
