export interface DemoService {
  name: string;
  cost: string;
}

export interface DemoStep {
  type: "result" | "summary";
  title: string;
  items: Array<{ label: string; detail: string; source?: string }>;
}

export interface DemoTab {
  id: string;
  label: string;
  prompt: string;
  services: DemoService[];
  totalCost: string;
  steps: DemoStep[];
  followUp: string;
}

export const DEMO_TABS: DemoTab[] = [
  {
    id: "code",
    label: "Code Generation",
    prompt: "Generate a hero image for my landing page and optimize it",
    services: [
      { name: "fal.ai", cost: "$0.005" },
      { name: "OpenAI", cost: "$0.003" },
    ],
    totalCost: "$0.008",
    steps: [
      {
        type: "result",
        title: "Generated image using FLUX Pro:",
        items: [{ label: "hero-dark.png", detail: "1024x768", source: "fal.ai" }],
      },
      {
        type: "result",
        title: "Optimized with GPT-4o Vision:",
        items: [{ label: "Alt text generated", detail: "42 tokens", source: "OpenAI" }],
      },
    ],
    followUp: "Want me to add it to your HTML?",
  },
  {
    id: "research",
    label: "Web Research",
    prompt: "Find the latest Canton Network news and summarize the top 3",
    services: [
      { name: "Firecrawl", cost: "$0.008" },
      { name: "Anthropic", cost: "$0.004" },
    ],
    totalCost: "$0.012",
    steps: [
      {
        type: "result",
        title: "Scraped 8 sources about Canton Network:",
        items: [
          { label: "canton.foundation", detail: "3 articles", source: "Firecrawl" },
          { label: "coinmarketcap.com", detail: "2 articles", source: "Firecrawl" },
          { label: "bsc.news", detail: "1 article", source: "Firecrawl" },
        ],
      },
      {
        type: "summary",
        title: "Top 3 developments:",
        items: [
          { label: "Moody\u2019s TIE on Canton", detail: "2 days ago" },
          { label: "BitGo named custodian", detail: "5 days ago" },
          { label: "$28.9M CC unlock", detail: "this week" },
        ],
      },
    ],
    followUp: "Export as markdown or continue researching?",
  },
  {
    id: "content",
    label: "Content Creation",
    prompt: "Write a Twitter thread about our SDK launch and generate a cover",
    services: [
      { name: "Anthropic", cost: "$0.004" },
      { name: "fal.ai", cost: "$0.008" },
      { name: "ElevenLabs", cost: "$0.003" },
    ],
    totalCost: "$0.015",
    steps: [
      {
        type: "result",
        title: "Draft thread (5 tweets):",
        items: [
          { label: "Introducing @caypo SDK v0.2.0...", detail: "tweet 1" },
          { label: "Five accounts, one agent...", detail: "tweet 2" },
          { label: "35 MCP tools for Claude, Cursor...", detail: "tweet 3" },
          { label: "Live on Canton DevNet, 312 tests...", detail: "tweet 4" },
          { label: "npm install @caypo/canton-sdk", detail: "tweet 5" },
        ],
      },
      {
        type: "result",
        title: "Generated cover image:",
        items: [{ label: "thread-cover.png", detail: "1200x675", source: "fal.ai" }],
      },
    ],
    followUp: "Post now or edit the thread?",
  },
];
