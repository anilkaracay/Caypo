export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "quickstart" | "package" | "cli" | "mcp" | "api" | "canton" | "resource";
  keywords: string[];
  anchor: string;
}

export const SEARCH_INDEX: SearchItem[] = [
  { id: "qs-install", title: "Install CLI", description: "npm install -g @caypo/canton-cli", category: "quickstart", keywords: ["install", "npm", "cli", "setup", "getting started"], anchor: "#quickstart" },
  { id: "qs-init", title: "Initialize Wallet", description: "caypo init — create wallet and Canton party", category: "quickstart", keywords: ["init", "wallet", "create", "party", "setup"], anchor: "#quickstart" },
  { id: "qs-transfer", title: "First Transfer", description: "Send USDCx using the SDK", category: "quickstart", keywords: ["transfer", "send", "usdcx", "sdk", "payment"], anchor: "#quickstart" },
  { id: "qs-pay", title: "Pay for an API", description: "MppPayClient — pay for gateway services", category: "quickstart", keywords: ["pay", "api", "mpp", "gateway", "402"], anchor: "#quickstart" },
  { id: "pkg-sdk", title: "@caypo/canton-sdk", description: "Core SDK — CantonClient, USDCxService, Keystore, SafeguardManager", category: "package", keywords: ["sdk", "canton", "client", "usdcx", "keystore", "safeguard"], anchor: "#packages" },
  { id: "pkg-mpp", title: "@caypo/mpp-canton", description: "MPP payment method — cantonMethod, cantonClient, cantonServer", category: "package", keywords: ["mpp", "payment", "method", "402", "canton"], anchor: "#packages" },
  { id: "pkg-cli", title: "@caypo/canton-cli", description: "CLI tool — 36 commands for wallet management", category: "package", keywords: ["cli", "command", "terminal", "shell"], anchor: "#packages" },
  { id: "pkg-mcp", title: "@caypo/canton-mcp", description: "MCP server — 35 tools, 20 prompts for Claude/Cursor", category: "package", keywords: ["mcp", "claude", "cursor", "windsurf", "tools", "prompts", "ai"], anchor: "#packages" },
  { id: "pkg-gateway", title: "@caypo/canton-gateway", description: "Gateway — 17 services, 46 endpoints, Hono server", category: "package", keywords: ["gateway", "proxy", "api", "services", "hono"], anchor: "#packages" },
  { id: "cli-balance", title: "caypo balance", description: "Show all account balances", category: "cli", keywords: ["balance", "checking", "savings", "accounts"], anchor: "#api" },
  { id: "cli-send", title: "caypo send", description: "Send USDCx to another party", category: "cli", keywords: ["send", "transfer", "usdcx"], anchor: "#api" },
  { id: "cli-pay", title: "caypo pay", description: "Pay for an MPP service", category: "cli", keywords: ["pay", "mpp", "api", "gateway"], anchor: "#api" },
  { id: "cli-savings", title: "caypo save / withdraw", description: "Deposit/withdraw savings, view APY", category: "cli", keywords: ["savings", "deposit", "withdraw", "apy", "yield", "save"], anchor: "#api" },
  { id: "cli-credit", title: "caypo borrow / repay", description: "Borrow/repay, view health factor", category: "cli", keywords: ["credit", "borrow", "repay", "health", "loan"], anchor: "#api" },
  { id: "cli-exchange", title: "caypo exchange", description: "Swap USDCx and CC", category: "cli", keywords: ["exchange", "swap", "usdcx", "cc", "dex"], anchor: "#api" },
  { id: "cli-invest", title: "caypo invest", description: "Buy/sell assets, DCA, portfolio", category: "cli", keywords: ["invest", "buy", "sell", "dca", "portfolio", "strategy"], anchor: "#api" },
  { id: "mcp-balance", title: "caypo_balance", description: "Get all account balances via MCP", category: "mcp", keywords: ["balance", "mcp", "tool", "claude"], anchor: "#api" },
  { id: "mcp-send", title: "caypo_send", description: "Send USDCx transfer via MCP", category: "mcp", keywords: ["send", "mcp", "tool", "transfer"], anchor: "#api" },
  { id: "mcp-pay", title: "caypo_pay", description: "Pay for API via MCP", category: "mcp", keywords: ["pay", "mcp", "tool", "api"], anchor: "#api" },
  { id: "api-canton-client", title: "CantonClient", description: "JSON Ledger API v2 client — submitCommand, getActiveContracts", category: "api", keywords: ["canton", "client", "ledger", "api", "json", "command", "contract"], anchor: "#api" },
  { id: "api-usdcx", title: "USDCxService", description: "Transfer, getBalance, getHoldings for USDCx", category: "api", keywords: ["usdcx", "transfer", "balance", "holdings", "stablecoin"], anchor: "#api" },
  { id: "api-keystore", title: "Keystore", description: "Encrypted wallet storage — AES-256-GCM", category: "api", keywords: ["keystore", "wallet", "encryption", "aes", "pin", "security"], anchor: "#api" },
  { id: "api-safeguard", title: "SafeguardManager", description: "Transaction limits, daily limits, wallet lock", category: "api", keywords: ["safeguard", "limit", "daily", "lock", "security"], anchor: "#api" },
  { id: "api-mpp-pay", title: "MppPayClient", description: "SDK client for paying MPP services", category: "api", keywords: ["mpp", "pay", "client", "402", "gateway"], anchor: "#api" },
  { id: "canton-party", title: "Party ID", description: "Canton identity format: DisplayName::hexfingerprint", category: "canton", keywords: ["party", "identity", "address", "canton"], anchor: "#canton" },
  { id: "canton-transfer", title: "TransferFactory", description: "CIP-56 transfer via TransferPreapproval", category: "canton", keywords: ["transfer", "cip-56", "holding", "preapproval"], anchor: "#canton" },
  { id: "canton-traffic", title: "Traffic (not gas)", description: "Canton uses traffic budgets, not per-tx gas", category: "canton", keywords: ["traffic", "gas", "cc", "burn", "cost"], anchor: "#canton" },
  { id: "canton-amounts", title: "String amounts", description: "All amounts are strings with up to 10 decimal places", category: "canton", keywords: ["amount", "string", "decimal", "precision", "numeric"], anchor: "#canton" },
  { id: "res-github", title: "GitHub Repository", description: "Source code, issues, contributions", category: "resource", keywords: ["github", "source", "code", "repo"], anchor: "#resources" },
  { id: "res-npm", title: "npm Packages", description: "5 published packages on npm", category: "resource", keywords: ["npm", "package", "install"], anchor: "#resources" },
  { id: "res-gateway", title: "CAYPO Gateway", description: "17 API services, 46 endpoints", category: "resource", keywords: ["gateway", "mpp", "api", "services"], anchor: "#resources" },
];

export function fuzzySearch(query: string, items: SearchItem[]): SearchItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return items
    .map((item) => {
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const keywordsStr = item.keywords.join(" ");

      if (titleLower.includes(q)) return { item, score: 3 };
      if (item.keywords.some((k) => k.includes(q))) return { item, score: 2 };
      if (descLower.includes(q)) return { item, score: 1 };
      const words = q.split(/\s+/);
      const all = `${titleLower} ${descLower} ${keywordsStr}`;
      if (words.every((w) => all.includes(w))) return { item, score: 0.5 };

      return null;
    })
    .filter((r): r is { item: SearchItem; score: number } => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((r) => r.item);
}

export const CATEGORY_LABELS: Record<string, string> = {
  quickstart: "Quick Start",
  package: "Package",
  cli: "CLI",
  mcp: "MCP",
  api: "API",
  canton: "Canton",
  resource: "Resource",
};
