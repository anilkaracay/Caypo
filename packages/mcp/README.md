# @caypo/canton-mcp

**MCP server connecting [Canton Network](https://canton.network) to Claude Desktop, Cursor, and Windsurf**

33 tools and 20 prompts for AI-assisted banking operations — check balances, send payments, pay for APIs, manage safeguards, and more.

[![License](https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue)](../../LICENSE-APACHE)
[![Tools](https://img.shields.io/badge/MCP%20tools-33-purple)](../../)
[![Prompts](https://img.shields.io/badge/MCP%20prompts-20-purple)](../../)

## Install

The easiest way:

```bash
caypo mcp install
```

Or manually add to your MCP config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "caypo": {
      "command": "npx",
      "args": ["@caypo/canton-mcp"],
      "env": { "CANTON_AGENT_CONFIG": "~/.caypo/config.json" }
    }
  }
}
```

## What You Can Ask

Once installed, talk to your AI assistant naturally:

> "What's my CAYPO balance?"

> "Send 5 USDCx to Alice::1220..."

> "Pay for a GPT-4 API call through the gateway"

> "Show my spending limits and daily usage"

> "Give me a morning financial briefing"

> "Run a security audit on my agent wallet"

## Tools (33)

| Category | Tools | Description |
|----------|-------|-------------|
| **Balance & Info** | `caypo_balance`, `caypo_address`, `caypo_history`, `caypo_positions`, `caypo_rates` | Account overview |
| **Checking** | `caypo_send`, `caypo_receive`, `caypo_contacts` | Send and receive USDCx |
| **MPP Payments** | `caypo_pay`, `caypo_pay_status`, `caypo_services` | Pay for APIs, check status |
| **Safeguards** | `caypo_safeguards`, `caypo_set_limit`, `caypo_lock` | Spending controls |
| **Traffic** | `caypo_traffic`, `caypo_purchase_traffic` | Validator bandwidth |
| **Savings** | 4 tools | Coming in Phase 3 |
| **Credit** | 3 tools | Coming in Phase 3 |
| **Exchange** | 2 tools | Coming in Phase 3 |
| **Investment** | 8 tools | Coming in Phase 4 |
| **Rewards** | 2 tools | Coming in Phase 3 |

## Prompts (20)

| Prompt | Description |
|--------|-------------|
| `morning_briefing` | Daily financial briefing with balance, spending, traffic |
| `financial_report` | Comprehensive account analysis with recommendations |
| `spending_analysis` | Categorize spending and identify patterns |
| `security_audit` | Check safeguards, wallet status, traffic health |
| `onboarding` | New user guide for Canton agent banking |
| *+ 15 more* | what_if, optimize_yield, risk_assessment, budget_plan, ... |

## Compatible With

- **Claude Desktop** (Anthropic)
- **Cursor** (AI code editor)
- **Windsurf** (Codeium)
- Any MCP-compatible AI tool

## License

Apache-2.0 OR MIT
