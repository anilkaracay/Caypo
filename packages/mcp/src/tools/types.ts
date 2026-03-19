/**
 * Tool definition type for MCP server.
 */

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}
