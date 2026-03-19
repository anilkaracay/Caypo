/**
 * Register all 20 prompts on the MCP server.
 * 5 fully implemented, 15 stubs.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

interface PromptDef {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description: string; required?: boolean }>;
  handler: (args: Record<string, string>) => { messages: Array<{ role: string; content: { type: string; text: string } }> };
}

function stubPrompt(name: string, description: string): PromptDef {
  return {
    name,
    description,
    handler: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please provide a ${description.toLowerCase()}. Note: This prompt template will be enhanced in a future version.`,
          },
        },
      ],
    }),
  };
}

const prompts: PromptDef[] = [
  // 5 fully implemented prompts
  {
    name: "morning_briefing",
    description: "Daily financial briefing — balance, spending, traffic, alerts",
    handler: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Good morning! Please give me my daily Canton agent briefing:

1. **Balance**: Call caypo_balance to get my current USDCx balance and holding count.
2. **Spending**: Call caypo_safeguards to check my daily spending vs limits.
3. **Traffic**: Call caypo_traffic to check validator traffic status.
4. **Recent activity**: Call caypo_history with limit=5 to show recent transactions.

Format as a concise morning briefing with key numbers highlighted.`,
          },
        },
      ],
    }),
  },
  {
    name: "financial_report",
    description: "Comprehensive financial report — all accounts, spending patterns, recommendations",
    handler: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a comprehensive financial report for my Canton agent:

1. Call caypo_balance for current balance
2. Call caypo_safeguards for spending limits and daily usage
3. Call caypo_history with limit=20 for recent transactions
4. Call caypo_traffic for traffic status

Analyze the data and provide:
- Total balance and holding efficiency (suggest merging if >5 UTXOs)
- Daily spending rate vs limits
- Traffic consumption trend
- Recommendations for limit adjustments`,
          },
        },
      ],
    }),
  },
  {
    name: "spending_analysis",
    description: "Analyze recent spending patterns and suggest optimizations",
    handler: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyze my spending patterns:

1. Call caypo_history with limit=50
2. Call caypo_safeguards for current limits
3. Call caypo_balance for current balance

Then:
- Categorize spending (API calls, transfers, etc.)
- Identify the most expensive API services
- Suggest whether my safeguard limits are appropriate
- Flag any unusual transaction patterns`,
          },
        },
      ],
    }),
  },
  {
    name: "security_audit",
    description: "Security audit — check safeguards, wallet status, traffic health",
    handler: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Perform a security audit of my Canton agent:

1. Call caypo_safeguards — are limits set appropriately?
2. Call caypo_traffic — is traffic healthy?
3. Call caypo_balance — any concerns about holding count?
4. Call caypo_address — verify network

Check for:
- Are safeguard limits reasonable? (tx limit should be < 10% of balance)
- Is the wallet locked when it should be?
- Are there too many UTXOs? (>10 = recommend merge)
- Is traffic balance sufficient?
- Any signs of unusual activity?`,
          },
        },
      ],
    }),
  },
  {
    name: "onboarding",
    description: "New user onboarding — explain Canton agent features and guide setup",
    handler: () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Welcome a new user to CAYPO — their Canton Network agent bank account. Explain:

1. **What CAYPO is**: A bank account for AI agents on Canton Network. Privacy-preserving, institutional-grade.
2. **Key features**: USDCx checking account, MPP auto-payments for APIs, safeguards, traffic management.
3. **How to get started**:
   - Call caypo_address to show their party ID
   - Call caypo_balance to check initial balance
   - Call caypo_safeguards to review default limits
   - Call caypo_services to see available paid APIs
4. **Important concepts**:
   - Canton uses party IDs, not addresses
   - USDCx is USDC-backed via Circle xReserve
   - Amounts are always strings (never floating point)
   - Traffic replaces gas (validator-level, not per-tx)
5. **Safety**: Safeguards protect against overspending. Always set appropriate limits.`,
          },
        },
      ],
    }),
  },
  // 15 stub prompts
  stubPrompt("what_if", "What-if financial scenario analysis"),
  stubPrompt("optimize_yield", "Yield optimization recommendations"),
  stubPrompt("risk_assessment", "Risk assessment for current positions"),
  stubPrompt("investment_thesis", "Investment thesis generation"),
  stubPrompt("rebalance_plan", "Portfolio rebalance plan"),
  stubPrompt("savings_strategy", "Savings strategy recommendations"),
  stubPrompt("credit_health", "Credit health assessment"),
  stubPrompt("traffic_report", "Detailed traffic consumption report"),
  stubPrompt("market_overview", "Canton market overview"),
  stubPrompt("portfolio_review", "Investment portfolio review"),
  stubPrompt("defi_opportunities", "DeFi opportunities on Canton"),
  stubPrompt("weekly_summary", "Weekly financial summary"),
  stubPrompt("budget_plan", "Budget planning assistant"),
  stubPrompt("tax_summary", "Transaction tax summary"),
  stubPrompt("troubleshoot", "Troubleshoot Canton agent issues"),
];

export function registerPrompts(server: Server): void {
  const promptMap = new Map<string, PromptDef>();
  for (const p of prompts) {
    promptMap.set(p.name, p);
  }

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: prompts.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const prompt = promptMap.get(request.params.name);
    if (!prompt) {
      throw new Error(`Unknown prompt: ${request.params.name}`);
    }
    return prompt.handler((request.params.arguments ?? {}) as Record<string, string>);
  });
}
