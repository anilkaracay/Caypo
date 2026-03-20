export const ACCOUNTS = [
  {
    id: "checking",
    name: "Checking",
    tagline: "Send and receive USDCx. Traffic handled automatically.",
    cli: "$ caypo send 50 to agent_0x9a\n✓ Sent 50.000000 USDCx\n✓ Traffic: 0.001 CC (auto)\n✓ Tx: canton://0x3f2a...",
    metrics: [
      { label: "Balance", value: "$2,847.50 USDCx" },
      { label: "Traffic Reserve", value: "12.4 CC" },
      { label: "Daily Limit", value: "$1,000 / $5,000" },
    ],
  },
  {
    id: "savings",
    name: "Savings",
    tagline: "Earn yield on idle USDCx. Protocol-agnostic adapters.",
    cli: "$ caypo save 1000\n✓ Deposited 1,000.00 USDCx\n  Protocol: Canton Yield (4.21% APY)\n  Savings balance: $1,200.00",
    metrics: [
      { label: "Deposited", value: "$1,200.00 USDCx" },
      { label: "APY", value: "4.21%" },
      { label: "Earned (30d)", value: "$4.12 USDCx" },
    ],
  },
  {
    id: "credit",
    name: "Credit",
    tagline: "Collateralized borrowing. Real-time health factor.",
    cli: "$ caypo borrow 200\n✓ Borrowed 200.00 USDCx\n  Rate: 7.83% APR\n  Health factor: 1.85",
    metrics: [
      { label: "Borrowed", value: "$200.00 USDCx" },
      { label: "Health Factor", value: "1.85" },
      { label: "Borrow Rate", value: "7.83% APR" },
    ],
  },
  {
    id: "exchange",
    name: "Exchange",
    tagline: "Atomic swaps. USDCx ↔ CC. Best execution.",
    cli: "$ caypo exchange 100 USDCx CC\n✓ Swapped 100.00 USDCx → 6,666.67 CC\n  Rate: 66.667 CC/USDCx\n  Fee: 0.30 USDCx (0.3%)",
    metrics: [
      { label: "CC Price", value: "$0.015 USDCx" },
      { label: "24h Change", value: "+2.5%" },
      { label: "Liquidity", value: "$1M+" },
    ],
  },
  {
    id: "investment",
    name: "Investment",
    tagline: "Strategies, DCA, portfolio tracking.",
    cli: "$ caypo invest strategy buy balanced 500\n✓ Executed balanced strategy\n  CC: 250.00 USDCx → 16,666 CC\n  USDCx: 250.00 (yield enabled)",
    metrics: [
      { label: "Portfolio Value", value: "$500.00" },
      { label: "P&L", value: "+$11.50 (+2.3%)" },
      { label: "Strategy", value: "Balanced 50/50" },
    ],
  },
];

export const TICKER_ITEMS = [
  "agent_0xf3 · sent $50.00 USDCx",
  "agent_0x9a · earned 4.21% APY",
  "agent_0x7c · swapped CC → USDCx",
  "agent_0xb1 · paid $0.003 API call",
  "agent_0x4e · borrowed $100 USDCx",
  "agent_0x2d · deposited $500 savings",
  "agent_0x8f · strategy buy balanced",
  "agent_0xa1 · repaid $50 + interest",
  "agent_0x6b · claimed CC rewards",
  "agent_0xc3 · rebalanced to 8% APY",
];

export const FLOW_STEPS = [
  { num: "01", title: "Agent requests a paid API", code: "GET /api/summarize" },
  { num: "02", title: "Server returns 402 + payment challenge", code: 'WWW-Authenticate: Payment method="canton" amount="0.01"' },
  { num: "03", title: "CAYPO SDK auto-pays from checking", code: "TransferFactory.Transfer → 0.01 USDCx → merchant" },
  { num: "04", title: "Agent retries with payment credential", code: 'Authorization: Payment credential="canton:tx/0x..."' },
  { num: "05", title: "Server verifies on Canton, delivers response", code: "200 OK + Payment-Receipt header" },
];

export const CANTON_ADVANTAGES = [
  { title: "Privacy by Default", desc: "Only transaction parties see payment details. No public ledger exposure." },
  { title: "Institutional Grade", desc: "DTCC, Goldman Sachs, JPMorgan, BNP Paribas already on Canton." },
  { title: "Deterministic Settlement", desc: "No re-orgs. No probabilistic finality. Every payment is final." },
  { title: "USDCx by Circle", desc: "USDC-backed stablecoin with privacy. $1 = $1, always." },
  { title: "Traffic, Not Gas", desc: "No volatile gas tokens. Predictable costs via traffic budgets." },
  { title: "Cross-App Composable", desc: "Atomic settlement across different Canton applications." },
];

export const STATS = [
  { value: "5", label: "npm packages published" },
  { value: "312", label: "tests passing" },
  { value: "35", label: "MCP tools available" },
  { value: "46", label: "API endpoints on gateway" },
  { value: "14", label: "E2E tests on DevNet" },
  { value: "10", label: "agent skills for AI" },
];

export const SERVICES = [
  "OpenAI", "Anthropic", "Google Gemini", "Groq", "fal.ai", "Firecrawl",
  "Perplexity", "Brave Search", "DeepSeek", "Resend", "Together AI",
  "ElevenLabs", "OpenWeather", "Google Maps", "Judge0", "Reloadly", "Lob",
];

export const TERMINAL_LINES = [
  { type: "cmd" as const, text: "$ caypo init" },
  { type: "out" as const, text: "✓ Created wallet: agent_0xf3a2..." },
  { type: "out" as const, text: "✓ Canton party allocated" },
  { type: "out" as const, text: "✓ Safeguards: $1,000/tx, $5,000/day" },
  { type: "gap" as const, text: "" },
  { type: "cmd" as const, text: "$ caypo balance" },
  { type: "out" as const, text: "  Checking    $2,847.50 USDCx" },
  { type: "out" as const, text: "  Savings     $1,200.00        4.21% APY" },
  { type: "out" as const, text: "  Credit      -$0.00           1.85 health" },
  { type: "out" as const, text: "  Investment  $500.00           +2.3% P&L" },
  { type: "out" as const, text: "  Total: $4,547.50" },
  { type: "gap" as const, text: "" },
  { type: "cmd" as const, text: "$ caypo pay https://api.example.com/summarize" },
  { type: "out" as const, text: "✓ 402 received — price: $0.003 USDCx" },
  { type: "out" as const, text: "✓ Paid from checking (Canton tx: 0x7a2f...)" },
  { type: "out" as const, text: "✓ Response received (247 tokens)" },
];
