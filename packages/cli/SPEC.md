# @cayvox/canton-cli — CLI Specification (Production)

Binary: `canton-agent` (alias: `ca`)

## Commands

```
SETUP
  init                              Interactive: PIN, ledger URL, JWT, party allocation, MCP
  address                           Party ID (e.g., Agent::1220abcd...)
  balance                           All account balances
  config                            Show/edit configuration
  mcp install                       Install MCP server for Claude/Cursor/Windsurf
  export-key                        Export private key (requires PIN)

CHECKING
  send <amount> to <recipient>      Send USDCx (party ID or ANS name)
  history [--limit N]               Transaction history

MPP PAYMENTS
  pay <url> [--data json] [--method POST] [--max-price amount]

SAFEGUARDS
  safeguards                        Show settings
  safeguards set-tx-limit <amount>
  safeguards set-daily-limit <amount>
  safeguards lock / unlock

TRAFFIC
  traffic                           Validator traffic balance
  traffic purchase <cc-amount>      Buy traffic with CC

PHASE 3+ (stubs in v1)
  save, withdraw, rebalance, earnings
  borrow, repay, health
  exchange, rates
  invest buy/sell/earn/strategy/auto/portfolio
  claim-rewards
```

## Technology: commander + chalk + ora + inquirer
