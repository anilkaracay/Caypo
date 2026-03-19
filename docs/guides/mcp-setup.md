# MCP Setup — Connect Canton to Claude, Cursor, Windsurf

The CAYPO MCP server gives AI assistants full access to your Canton bank account — 35 tools and 20 prompts.

## Quick Install

```bash
caypo mcp install
```

This auto-configures Claude Desktop, Cursor, and Windsurf.

## Manual Configuration

Add to your MCP config file:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "caypo": {
      "command": "npx",
      "args": ["@caypo/canton-mcp"],
      "env": {
        "CANTON_AGENT_CONFIG": "~/.caypo/config.json"
      }
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`) — same format.

**Windsurf** (`~/.windsurf/mcp.json`) — same format.

Restart the AI tool after adding the configuration.

## Example Conversations

### Check Balance

> **You:** What's my CAYPO balance?
>
> **Claude:** *(calls caypo_balance)*
>
> Your CAYPO account on Canton testnet:
> - **Checking:** 85.00 USDCx (3 UTXOs)
> - **Savings:** 200.00 USDCx (4.21% APY)
> - **Net Total:** 285.00 USDCx

### Send Payment

> **You:** Send 5 USDCx to Alice::1220abcdef...
>
> **Claude:** *(calls caypo_send)* Sent 5.00 USDCx to Alice. Update ID: upd-abc123.

### Pay for API

> **You:** Use the CAYPO gateway to ask GPT-4 what the weather is like in Istanbul
>
> **Claude:** *(calls caypo_pay)* Paid 0.01 USDCx. GPT-4 says: Istanbul currently has partly cloudy skies...

### Morning Briefing

> **You:** Give me my morning briefing
>
> **Claude:** *(uses morning_briefing prompt, calls 5 tools)*
>
> **Morning Briefing — March 19, 2026**
> - Balance: 285.00 USDCx
> - Today's spending: 12.50 / 500.00 limit
> - Savings yield: +0.023 USDCx today
> - Traffic: Sufficient (9.8M remaining)
> - Recommendation: Consider depositing idle checking funds to savings

## Available Tools (35)

| Category | Tools |
|----------|-------|
| Balance & Info | `caypo_balance`, `caypo_address`, `caypo_history`, `caypo_positions`, `caypo_rates` |
| Checking | `caypo_send`, `caypo_receive`, `caypo_contacts` |
| Savings | `caypo_save`, `caypo_withdraw`, `caypo_rebalance_savings`, `caypo_earnings` |
| Credit | `caypo_borrow`, `caypo_repay`, `caypo_health` |
| Exchange | `caypo_exchange`, `caypo_quote` |
| Investment | `caypo_invest_buy`, `caypo_invest_sell`, `caypo_invest_earn`, `caypo_invest_unearn`, `caypo_invest_rebalance`, `caypo_portfolio`, `caypo_strategy_buy`, `caypo_auto_invest` |
| MPP | `caypo_pay`, `caypo_pay_status`, `caypo_services` |
| Safeguards | `caypo_safeguards`, `caypo_set_limit`, `caypo_lock` |
| Traffic | `caypo_traffic`, `caypo_purchase_traffic` |
| Rewards | `caypo_claim_rewards`, `caypo_reward_history` |

## Available Prompts (20)

| Prompt | Description |
|--------|-------------|
| `morning_briefing` | Daily financial overview |
| `financial_report` | Comprehensive analysis |
| `spending_analysis` | Spending patterns |
| `security_audit` | Wallet security check |
| `onboarding` | New user guide |
| `portfolio_review` | Investment review |
| `optimize_yield` | Yield optimization |
| `risk_assessment` | Risk analysis |
| `credit_health` | Credit health check |
| `rebalance_plan` | Rebalance recommendations |
| *+ 10 more* | weekly_summary, budget_plan, market_overview, ... |

## Troubleshooting

**MCP server not starting:**
- Check `caypo mcp install` ran successfully
- Verify `~/.caypo/config.json` exists (`caypo init` first)
- Restart your AI tool

**Tools not appearing:**
- Some tools require a configured wallet — run `caypo init`
- Check the AI tool's MCP log for errors

**Permission errors:**
- The MCP server needs read access to `~/.caypo/`
- On macOS, grant Terminal/iTerm full disk access if needed
