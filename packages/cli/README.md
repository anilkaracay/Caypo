# @caypo/canton-cli

**CLI for AI agent banking on [Canton Network](https://canton.network)**

Manage your USDCx wallet, send payments, pay for APIs, and configure MCP server — all from the terminal.

[![License](https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue)](../../LICENSE-APACHE)

## Install

```bash
npm install -g @caypo/canton-cli
```

## Commands

```
SETUP
  caypo init                              Set up wallet (PIN, ledger URL, JWT, party)
  caypo address                           Show your Canton party ID
  caypo balance                           Show USDCx balance and holdings

PAYMENTS
  caypo send <amount> to <recipient>      Send USDCx to a party
  caypo pay <url> [--max-price N]         Pay for API (auto 402 flow)

SAFEGUARDS
  caypo safeguards                        View spending limits
  caypo safeguards set-tx-limit <amt>     Set per-transaction limit
  caypo safeguards set-daily-limit <amt>  Set daily spending limit
  caypo safeguards lock                   Lock wallet
  caypo safeguards unlock                 Unlock wallet

TRAFFIC
  caypo traffic                           Validator traffic balance

MCP
  caypo mcp install                       Install for Claude/Cursor/Windsurf
```

## Examples

### Set up a new wallet

```
$ caypo init

  CAYPO — A bank account for AI agents on Canton Network

  ? Choose a PIN for your wallet: ****
  ? Confirm PIN: ****
  ? Canton Ledger URL: http://localhost:7575
  ? JWT bearer token: ****
  ? Agent display name: MyAgent

  [OK] Party allocated
  [OK] Keystore created

  Party ID: MyAgent::1220abcdef...
  Config:   ~/.caypo/config.json
```

### Check balance

```
$ caypo balance

  Checking Account

  Balance:   50.00 USDCx
  Holdings:  3 UTXOs
  Address:   MyAgent::1220abcdef...
  Network:   testnet
```

### Pay for an API call

```
$ caypo pay https://mpp.caypo.xyz/openai/v1/chat/completions --max-price 0.05

  [OK] Paid 0.01 USDCx for API access
  Update ID: upd-abc123
  Status:    200
```

### Install MCP server

```
$ caypo mcp install

  [OK] Claude Desktop
  [OK] Cursor
  [OK] Windsurf

  MCP server installed for 3 tools.
  Restart your AI tool to activate.
```

## License

Apache-2.0 OR MIT
