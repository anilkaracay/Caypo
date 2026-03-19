/**
 * @caypo/canton-mcp — MCP server for Canton Network agent.
 * 33 tools + 20 prompts for AI agent integration.
 *
 * Transport: stdio (standard for Claude Desktop MCP servers)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CantonAgent } from "@caypo/canton-sdk";
import { registerTools } from "./tools/index.js";
import { registerPrompts } from "./prompts/index.js";

export const CANTON_MCP_VERSION = "0.1.0";

async function main() {
  // 1. Create agent
  const agent = await CantonAgent.create({
    token: process.env.CANTON_JWT ?? "",
  });

  // 2. Create MCP server
  const server = new Server(
    { name: "caypo", version: CANTON_MCP_VERSION },
    { capabilities: { tools: {}, prompts: {} } },
  );

  // 3. Register tools and prompts
  registerTools(server, agent);
  registerPrompts(server);

  // 4. Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
