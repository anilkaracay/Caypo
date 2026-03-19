# @caypo/canton-cli

CLI tool for Canton Network agent. Manage your USDCx account, send payments, and configure AI tool integrations.

## Install

```bash
pnpm add -g @caypo/canton-cli
```

## Commands

```
caypo init                              Interactive wallet setup
caypo balance                           Show USDCx balance
caypo send <amount> to <recipient>      Send USDCx
caypo pay <url> [--max-price N]         Pay for API (402 auto-pay)
caypo address                           Show party ID
caypo safeguards                        View/set limits
caypo safeguards set-tx-limit <amount>  Set per-tx limit
caypo safeguards lock / unlock          Lock/unlock wallet
caypo traffic                           Validator traffic balance
caypo mcp install                       Install MCP server for AI tools
```

## Quick Start

```bash
# Set up wallet
caypo init

# Check balance
caypo balance

# Send payment
caypo send 10.00 to Bob::1220abcd...

# Install MCP server for Claude Desktop
caypo mcp install
```

## License

Apache-2.0 OR MIT
