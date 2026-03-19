# @caypo/canton-mcp

MCP (Model Context Protocol) server for Canton Network agent. Provides 33 tools and 20 prompts for AI assistant integration.

## Install

```bash
caypo mcp install
# Or manually add to your MCP config:
```

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

## Tools (33)

| Group | Tools | Status |
|-------|-------|--------|
| Balance & Info | caypo_balance, caypo_address, caypo_history, caypo_positions, caypo_rates | Live |
| Checking | caypo_send, caypo_receive, caypo_contacts | Live |
| MPP Payments | caypo_pay, caypo_pay_status, caypo_services | Live |
| Safeguards | caypo_safeguards, caypo_set_limit, caypo_lock | Live |
| Traffic | caypo_traffic, caypo_purchase_traffic | Live |
| Savings | 4 tools | Phase 3 |
| Credit | 3 tools | Phase 3 |
| Exchange | 2 tools | Phase 3 |
| Investment | 8 tools | Phase 4 |
| Rewards | 2 tools | Phase 3 |

## Prompts (20)

morning_briefing, financial_report, spending_analysis, security_audit, onboarding, and 15 more.

## License

Apache-2.0 OR MIT
