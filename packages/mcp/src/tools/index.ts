/**
 * Register all 33 tools on the MCP server.
 * ALL tools are now live (no stubs).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { CantonAgent } from "@caypo/canton-sdk";
import { balanceTools } from "./balance.js";
import { checkingTools } from "./checking.js";
import { savingsTools } from "./savings.js";
import { creditTools } from "./credit.js";
import { exchangeTools } from "./exchange.js";
import { investmentTools } from "./investment.js";
import { mppTools } from "./mpp.js";
import { safeguardTools } from "./safeguards.js";
import { trafficTools } from "./traffic.js";
import { rewardTools } from "./rewards.js";
import type { ToolDef } from "./types.js";

export function registerTools(server: Server, agent: CantonAgent): void {
  const allTools: ToolDef[] = [
    ...balanceTools(agent),      // 5
    ...checkingTools(agent),     // 3
    ...savingsTools(agent),      // 4
    ...creditTools(agent),       // 3
    ...exchangeTools(agent),     // 2
    ...investmentTools(agent),   // 8
    ...mppTools(agent),          // 3
    ...safeguardTools(agent),    // 3
    ...trafficTools(agent),      // 2
    ...rewardTools(agent),       // 2
  ];                             // = 33 total

  const toolMap = new Map<string, ToolDef>();
  for (const tool of allTools) {
    toolMap.set(tool.name, tool);
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: allTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = toolMap.get(request.params.name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
        isError: true,
      };
    }

    try {
      return await tool.handler((request.params.arguments ?? {}) as Record<string, unknown>);
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  });
}
