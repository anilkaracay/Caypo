export interface GatewayTerminalDemo {
  id: string;
  label: string;
  service: string;
  command: string;
  challengeAmount: string;
  txId: string;
  paymentTiming: string;
  responseJson: Record<string, unknown>;
  receiptSummary: string;
}

export const GATEWAY_TERMINAL_DEMOS: GatewayTerminalDemo[] = [
  {
    id: "openai",
    label: "OpenAI",
    service: "GPT-4o",
    command: "caypo pay \\\n    https://mpp.caypo.xyz/openai/v1/chat/completions \\\n    -X POST --json '{\"model\":\"gpt-4o\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'",
    challengeAmount: "0.003",
    txId: "20260320142350001:0",
    paymentTiming: "240ms",
    responseJson: {
      model: "gpt-4o",
      choices: [{ message: { content: "Hello! How can I help you today?" } }],
      usage: { total_tokens: 28 },
    },
    receiptSummary: "Cost: $0.003 USDCx \u00b7 28 tokens \u00b7 620ms total",
  },
  {
    id: "fal",
    label: "fal.ai",
    service: "FLUX Pro",
    command: "caypo pay \\\n    https://mpp.caypo.xyz/fal/v1/generate \\\n    -X POST --json '{\"model\":\"flux-pro\",\"prompt\":\"Minimal AI agent logo\",\"size\":\"1024x1024\"}'",
    challengeAmount: "0.035",
    txId: "20260320142350002:0",
    paymentTiming: "260ms",
    responseJson: {
      image: "https://cdn.fal.ai/results/abc123.png",
      model: "flux-pro",
      size: "1024x1024",
      inference_time: 3.2,
      seed: 42981,
    },
    receiptSummary: "Cost: $0.035 USDCx \u00b7 1024\u00d71024 \u00b7 3.5s total",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    service: "Claude Sonnet",
    command: "caypo pay \\\n    https://mpp.caypo.xyz/anthropic/v1/messages \\\n    -X POST --json '{\"model\":\"claude-sonnet-4-20250514\",\"messages\":[{\"role\":\"user\",\"content\":\"Summarize MPP in one sentence\"}]}'",
    challengeAmount: "0.004",
    txId: "20260320142350003:0",
    paymentTiming: "230ms",
    responseJson: {
      model: "claude-sonnet-4-20250514",
      content: [{ text: "MPP lets any client pay for any API in the same HTTP request using a 402-based challenge-credential flow." }],
      usage: { input_tokens: 18, output_tokens: 31 },
    },
    receiptSummary: "Cost: $0.004 USDCx \u00b7 49 tokens \u00b7 650ms total",
  },
];
