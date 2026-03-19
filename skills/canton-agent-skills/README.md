# @caypo/canton-agent-skills

**Agent skills for CAYPO on [Canton Network](https://canton.network)**

10 skills for AI coding assistants — check balances, send payments, earn yield, borrow, swap, and more. Works with Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Windsurf, and Amp.

[![License](https://img.shields.io/badge/license-Apache--2.0%20%2F%20MIT-blue)](../../LICENSE-APACHE)
[![Skills](https://img.shields.io/badge/skills-10-purple)](../../)

## Install

```bash
npx skills add @caypo/canton-agent-skills
```

Requires `@caypo/canton-cli` to be installed:
```bash
npm install -g @caypo/canton-cli
```

## Skills

| Skill | Command | Triggers |
|-------|---------|----------|
| **caypo-check-balance** | `caypo balance` | "check balance", "how much do I have", "wallet balance" |
| **caypo-send** | `caypo send {amount} to {recipient}` | "send USDCx", "transfer funds", "pay to" |
| **caypo-save** | `caypo save {amount}` | "save money", "earn yield", "deposit to savings" |
| **caypo-withdraw** | `caypo withdraw {amount}` | "withdraw savings", "move to checking" |
| **caypo-exchange** | `caypo exchange {amount} {from} {to}` | "swap tokens", "buy CC", "convert" |
| **caypo-borrow** | `caypo borrow {amount}` | "borrow money", "take a loan", "get credit" |
| **caypo-repay** | `caypo repay {amount}` | "repay loan", "pay back", "settle debt" |
| **caypo-pay** | `caypo pay {url} --max-price {price}` | "pay for API", "mpp pay", "402 payment" |
| **caypo-sentinel** | `caypo safeguards` | "spending limits", "security settings", "lock wallet" |
| **caypo-rebalance** | `caypo rebalance` | "optimize yield", "best rate", "rebalance" |

## Compatible Platforms

| Platform | Status |
|----------|--------|
| **Claude Code** (Anthropic) | Supported |
| **OpenAI Codex** | Supported |
| **GitHub Copilot** | Supported |
| **Cursor** | Supported |
| **Windsurf** (Codeium) | Supported |
| **Amp** | Supported |

## Usage Examples

### Claude Code

```
You: "Check my CAYPO balance"
Claude: [runs caypo balance]

  CAYPO · Canton testnet
  ────────────────────────────────────
  Checking:    85.00 USDCx  (3 UTXOs)
  Savings:     200.00 USDCx  (4.21% APY)
  Net Total:   285.00 USDCx
```

### OpenAI Codex / Copilot

```
// Ask: "Send 10 USDCx to Bob"
// Codex runs: caypo send 10 to Bob::1220abcdef...
// Output: ✓ Sent 10 USDCx successfully!
```

### Cursor / Windsurf

```
> "Rebalance my savings to the best yield"
> [runs caypo rebalance]
> ✓ Moved funds from mock-yield to better-yield (8.0% APY)
```

## How It Works

Each skill is a YAML file defining:
- **name**: Unique skill identifier
- **triggers**: Natural language phrases that activate the skill
- **action**: CLI command to execute
- **output**: Expected output format

When an AI assistant detects a trigger phrase, it runs the corresponding `caypo` CLI command and returns the output.

## License

Apache-2.0 OR MIT
