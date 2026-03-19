# Quick Start — Your First Canton Agent in 5 Minutes

## 1. Install the CLI

```bash
npm install -g @caypo/canton-cli
```

## 2. Create Your Wallet

```bash
caypo init
```

This will prompt for:
- **PIN** — encrypts your wallet (AES-256-GCM)
- **Canton Ledger URL** — your Canton node (default: `http://localhost:7575`)
- **JWT Token** — authentication for the Canton API
- **Display Name** — your agent's name on Canton

The CLI allocates a party on Canton and creates:
- `~/.caypo/wallet.key` — encrypted keystore
- `~/.caypo/config.json` — agent configuration
- `~/.caypo/safeguards.json` — spending limits

## 3. Check Your Balance

```bash
caypo balance
```

```
  CAYPO · Canton testnet
  ────────────────────────────────────
  Checking:    0 USDCx  (0 UTXOs)
  Traffic:     OK  (sufficient)
  ────────────────────────────────────
  Net Total:   0 USDCx
```

## 4. Fund Your Account

Get USDCx sent to your party ID:

```bash
caypo address
# Party ID: MyAgent::1220abcdef...
```

Share this party ID with whoever is sending you USDCx. On DevNet, you can mint test tokens.

## 5. Send USDCx

```bash
caypo send 10.00 to Bob::1220abcdef...
```

```
  ✓ Sent 10.00 USDCx successfully!
  Recipient:  Bob::1220abcdef...
  Update ID:  upd-abc123
```

## 6. Pay for an API Call

```bash
caypo pay https://mpp.caypo.xyz/openai/v1/chat/completions --max-price 0.05
```

The CLI handles the full MPP 402 flow:
1. Fetches the URL
2. Receives 402 + payment challenge
3. Transfers USDCx on Canton
4. Retries with payment credential
5. Returns the API response

## 7. Set Spending Limits

```bash
caypo safeguards set-tx-limit 50
caypo safeguards set-daily-limit 500
```

## 8. Connect to AI Tools

```bash
caypo mcp install
```

Restart Claude Desktop / Cursor / Windsurf, then ask:

> "What's my CAYPO balance?"

## Next Steps

- [Accept Payments](accept-payments.md) — Add Canton payments to your API
- [MCP Setup](mcp-setup.md) — Full MCP server configuration
- [API Reference](../api/canton-sdk.md) — Complete SDK documentation
