# @cayvox/canton-mcp — MCP Server Specification (Production)

## Stats: 33 tools + 20 prompts (matching t2000)

## Installation

```bash
canton-agent mcp install
# Creates config for Claude Desktop / Cursor / Windsurf
```

MCP config entry:
```json
{
  "mcpServers": {
    "canton-agent": {
      "command": "npx",
      "args": ["@cayvox/canton-mcp"],
      "env": { "CANTON_AGENT_CONFIG": "~/.canton-agent/config.json" }
    }
  }
}
```

Transport: **stdio** (standard for Claude Desktop MCP servers)

## Tools (33)

### Balance & Info (5)
- `canton_balance` — All account balances (queries Holding contracts via `/v2/state/active-contracts`)
- `canton_address` — Party ID and network info
- `canton_history` — Transaction history via `/v2/updates/flats`
- `canton_positions` — DeFi positions (Phase 3 stub)
- `canton_rates` — Exchange rates and APYs (Phase 3 stub)

### Checking (3)
- `canton_send` — Send USDCx via TransferFactory_Transfer
- `canton_receive` — Show party ID + deposit instructions
- `canton_contacts` — Manage contact list (local JSON)

### Savings (4) — Phase 3 stubs
- `canton_save`, `canton_withdraw`, `canton_rebalance_savings`, `canton_earnings`

### Credit (3) — Phase 3 stubs
- `canton_borrow`, `canton_repay`, `canton_health`

### Exchange (2) — Phase 3 stubs
- `canton_exchange`, `canton_quote`

### Investment (8) — Phase 4 stubs
- `canton_invest_buy`, `canton_invest_sell`, `canton_invest_earn`, `canton_invest_unearn`
- `canton_invest_rebalance`, `canton_portfolio`, `canton_strategy_buy`, `canton_auto_invest`

### MPP Payments (3)
- `canton_pay` — Pay for API via MPP (402 auto-handling)
- `canton_pay_status` — Check payment by updateId
- `canton_services` — List MPP gateway services

### Safeguards (3)
- `canton_safeguards` — View limits
- `canton_set_limit` — Set tx/daily limits
- `canton_lock` — Lock/unlock wallet

### Traffic (2)
- `canton_traffic` — Validator traffic balance
- `canton_purchase_traffic` — Buy traffic with CC

### Rewards (2) — Phase 3 stubs
- `canton_claim_rewards`, `canton_reward_history`

## Prompts (20)

morning_briefing, financial_report, what_if, optimize_yield, risk_assessment,
investment_thesis, rebalance_plan, savings_strategy, credit_health, spending_analysis,
traffic_report, market_overview, portfolio_review, defi_opportunities, weekly_summary,
budget_plan, tax_summary, onboarding, troubleshoot, security_audit

## Implementation

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CantonAgent } from "@cayvox/canton-sdk";

const agent = await CantonAgent.create();
const server = new Server({ name: "canton-agent", version: "1.0.0" }, {
  capabilities: { tools: {}, prompts: {} },
});

// Register tools and prompts...
const transport = new StdioServerTransport();
await server.connect(transport);
```
