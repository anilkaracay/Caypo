/**
 * Register all 33 tools on the MCP server.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { CantonAgent } from "@caypo/canton-sdk";
import { balanceTools } from "./balance.js";
import { checkingTools } from "./checking.js";
import { mppTools } from "./mpp.js";
import { safeguardTools } from "./safeguards.js";
import { trafficTools } from "./traffic.js";
import { stubTools } from "./stubs.js";
import type { ToolDef } from "./types.js";

export function registerTools(server: Server, agent: CantonAgent): void {
  const allTools: ToolDef[] = [
    ...balanceTools(agent),
    ...checkingTools(agent),
    ...mppTools(agent),
    ...safeguardTools(agent),
    ...trafficTools(agent),
    ...stubTools(),
  ];

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
