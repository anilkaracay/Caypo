export const PACKAGES = [
  {
    name: "@caypo/canton-sdk",
    shortName: "SDK",
    description: "Canton JSON Ledger API v2 client, USDCxService for CIP-56 transfers, encrypted Keystore, SafeguardManager, TrafficManager, and MppPayClient.",
    size: "large" as const,
    npm: "https://www.npmjs.com/package/@caypo/canton-sdk",
    github: "https://github.com/anilkaracay/Caypo/tree/main/packages/sdk",
    importExample: "import { CantonClient } from '@caypo/canton-sdk'",
    keyFeatures: ["CantonClient", "USDCxService", "Keystore", "SafeguardManager", "MppPayClient"],
  },
  {
    name: "@caypo/mpp-canton",
    shortName: "MPP",
    description: "MPP payment method for Canton. cantonMethod definition, cantonClient for credentials, cantonServer for payment verification.",
    size: "medium" as const,
    npm: "https://www.npmjs.com/package/@caypo/mpp-canton",
    github: "https://github.com/anilkaracay/Caypo/tree/main/packages/mpp",
    importExample: "import { cantonMethod } from '@caypo/mpp-canton'",
    keyFeatures: ["cantonMethod", "cantonClient", "cantonServer"],
  },
  {
    name: "@caypo/canton-cli",
    shortName: "CLI",
    description: "36 commands for agent wallet management. init, balance, send, pay, savings, credit, exchange, invest, and more.",
    size: "small" as const,
    npm: "https://www.npmjs.com/package/@caypo/canton-cli",
    github: "https://github.com/anilkaracay/Caypo/tree/main/packages/cli",
    importExample: "$ npm install -g @caypo/canton-cli",
    keyFeatures: ["36 commands", "21 top-level", "15 sub-commands"],
  },
  {
    name: "@caypo/canton-mcp",
    shortName: "MCP",
    description: "MCP server with 35 tools and 20 prompts. Works with Claude Desktop, Cursor, Windsurf, and any MCP client.",
    size: "small" as const,
    npm: "https://www.npmjs.com/package/@caypo/canton-mcp",
    github: "https://github.com/anilkaracay/Caypo/tree/main/packages/mcp",
    importExample: "$ npx @caypo/canton-mcp",
    keyFeatures: ["35 tools", "20 prompts", "stdio transport"],
  },
  {
    name: "@caypo/canton-gateway",
    shortName: "Gateway",
    description: "Hono-based MPP API proxy. 17 upstream services, 46 endpoints with TransferPreapproval payment verification.",
    size: "small" as const,
    npm: "https://www.npmjs.com/package/@caypo/canton-gateway",
    github: "https://github.com/anilkaracay/Caypo/tree/main/packages/gateway",
    importExample: "import { app } from '@caypo/canton-gateway'",
    keyFeatures: ["17 services", "46 endpoints", "Hono framework"],
  },
];

export const CLI_COMMANDS = [
  { command: "caypo init", description: "Initialize wallet + Canton party" },
  { command: "caypo balance", description: "Show all account balances" },
  { command: "caypo send", description: "Send USDCx to another party" },
  { command: "caypo pay", description: "Pay for an MPP service" },
  { command: "caypo address", description: "Show party ID" },
  { command: "caypo safeguards", description: "View/set transaction limits" },
  { command: "caypo traffic", description: "Monitor traffic usage" },
  { command: "caypo mcp install", description: "Install MCP server" },
  { command: "caypo save", description: "Deposit to savings" },
  { command: "caypo withdraw", description: "Withdraw from savings" },
  { command: "caypo borrow", description: "Borrow against savings" },
  { command: "caypo repay", description: "Repay credit balance" },
  { command: "caypo exchange", description: "Swap USDCx and CC" },
  { command: "caypo invest buy", description: "Buy assets" },
  { command: "caypo invest sell", description: "Sell assets" },
  { command: "caypo portfolio", description: "Investment portfolio P&L" },
];

export const MCP_TOOLS_TOP = [
  { tool: "caypo_balance", description: "Get all account balances" },
  { tool: "caypo_send", description: "Send USDCx transfer" },
  { tool: "caypo_pay", description: "Pay for an MPP API service" },
  { tool: "caypo_save", description: "Deposit to savings account" },
  { tool: "caypo_borrow", description: "Borrow from credit account" },
  { tool: "caypo_exchange", description: "Exchange USDCx and CC" },
  { tool: "caypo_invest_buy", description: "Buy assets for investment" },
  { tool: "caypo_safeguards", description: "View/set spending limits" },
  { tool: "caypo_history", description: "Transaction history" },
  { tool: "caypo_portfolio", description: "Investment portfolio P&L" },
];

export const CANTON_COMPARISON = [
  { evm: "Wallet address", canton: "Party ID (DisplayName::hex)" },
  { evm: "ERC-20 token", canton: "CIP-56 Holding contract" },
  { evm: "Transfer", canton: "TransferFactory.Transfer choice" },
  { evm: "Gas (ETH)", canton: "Traffic (CC)" },
  { evm: "Smart contract", canton: "DAML template" },
  { evm: "Block explorer", canton: "ccview.io" },
  { evm: "JSON-RPC", canton: "JSON Ledger API v2 (port 7575)" },
  { evm: "Public ledger", canton: "Privacy by default" },
  { evm: "Nonce", canton: "Command ID (UUID)" },
  { evm: "Token decimals (18)", canton: "Amount precision (10 decimals)" },
];

export const QUICKSTART_TABS = [
  {
    id: "install",
    label: "Install",
    description: "Get your wallet running in 30 seconds",
    language: "shell",
    code: `# Install the CLI globally
$ npm install -g @caypo/canton-cli

# Initialize a new wallet
$ caypo init
✓ Wallet created: agent_0xf3a2::1220847...
✓ Canton party allocated
✓ Keystore encrypted (AES-256-GCM)
✓ Safeguards set: $1,000/tx, $5,000/day

# Check your balance
$ caypo balance
  Checking    $0.00 USDCx
  Savings     $0.00
  Credit      $0.00
  Investment  $0.00
  Total: $0.00`,
  },
  {
    id: "transfer",
    label: "First Transfer",
    description: "Send your first USDCx transfer",
    language: "typescript",
    code: `import { CantonAgent } from '@caypo/canton-sdk';

// Create agent from config
const agent = await CantonAgent.create({
  ledgerUrl: 'http://localhost:7575',
  token: process.env.CANTON_JWT,
  partyId: 'Alice::122084768362d0ce...',
  network: 'devnet',
});

// Send USDCx (safeguards checked automatically)
const tx = await agent.checking.send(
  'Bob::122084768362d0ce...',
  '50.000000'  // Always strings, never floats
);

console.log(\`Sent! Update ID: \${tx.updateId}\`);
// → Sent! Update ID: upd-0x7a2f...`,
  },
  {
    id: "mpp",
    label: "Pay for an API",
    description: "Make a paid API call through the gateway",
    language: "typescript",
    code: `import { CantonAgent } from '@caypo/canton-sdk';

const agent = await CantonAgent.create();

// Pay for a GPT-4o request through CAYPO Gateway
const result = await agent.mpp.pay(
  'https://mpp.caypo.xyz/openai/v1/chat/completions',
  {
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello!' }],
    }),
    maxPrice: '0.01',  // Max USDCx willing to pay
  }
);

console.log(result.response.status); // 200
console.log(result.receipt);
// → { updateId: "...", amount: "0.003", ... }`,
  },
];

export const RESOURCES = [
  { title: "GitHub", url: "https://github.com/anilkaracay/Caypo", description: "Source code, issues, contributions", detail: "anilkaracay/Caypo" },
  { title: "npm", url: "https://www.npmjs.com/org/caypo", description: "5 packages published", detail: "npmjs.com/org/caypo" },
  { title: "Canton Network", url: "https://canton.network", description: "Institutional blockchain with privacy", detail: "canton.network" },
  { title: "Gateway", url: "/gateway", description: "17 services, 46 endpoints", detail: "mpp.caypo.xyz" },
  { title: "MPP Protocol", url: "https://mpp.dev", description: "Machine Payments Protocol by Stripe + Tempo", detail: "mpp.dev" },
  { title: "Canton Explorer", url: "https://ccview.io", description: "Canton Network block explorer", detail: "ccview.io" },
];
