/**
 * MPP Payment tools (3): caypo_pay, caypo_pay_status, caypo_services
 */

import type { CantonAgent } from "@caypo/canton-sdk";
import type { ToolDef } from "./types.js";

export function mppTools(agent: CantonAgent): ToolDef[] {
  return [
    {
      name: "caypo_pay",
      description: "Pay for an API call via MPP (HTTP 402 auto-handling). Fetches URL, handles payment if 402, returns response.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to fetch" },
          method: { type: "string", description: "HTTP method", default: "GET" },
          body: { type: "string", description: "Request body (JSON string)" },
          maxPrice: { type: "string", description: "Maximum price willing to pay in USDCx" },
        },
        required: ["url"],
      },
      handler: async (args) => {
        const { url, method, body, maxPrice } = args as {
          url: string; method?: string; body?: string; maxPrice?: string;
        };
        const result = await agent.mpp.pay(url, {
          method,
          body,
          maxPrice,
          headers: body ? { "Content-Type": "application/json" } : undefined,
        });
        const responseBody = await result.response.text();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: result.response.status,
                paid: result.paid,
                receipt: result.receipt,
                body: responseBody.slice(0, 2000),
              }, null, 2),
            },
          ],
        };
      },
    },
    {
      name: "caypo_pay_status",
      description: "Check payment status by Canton update ID",
      inputSchema: {
        type: "object",
        properties: {
          updateId: { type: "string", description: "Canton transaction update ID" },
        },
        required: ["updateId"],
      },
      handler: async () => ({
        content: [{ type: "text", text: "Payment status lookup requires gateway integration. Use the updateId with the Canton Ledger API directly." }],
      }),
    },
    {
      name: "caypo_services",
      description: "List available MPP gateway services and pricing",
      inputSchema: { type: "object", properties: {}, required: [] },
      handler: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              gateway: "mpp.cayvox.io",
              services: [
                { name: "OpenAI", path: "/openai", price: "$0.001-$0.05" },
                { name: "Anthropic", path: "/anthropic", price: "$0.01" },
                { name: "fal.ai", path: "/fal", price: "$0.01-$0.10" },
                { name: "Firecrawl", path: "/firecrawl", price: "$0.005-$0.02" },
                { name: "Google Gemini", path: "/gemini", price: "$0.005-$0.02" },
                { name: "Groq", path: "/groq", price: "$0.001-$0.005" },
                { name: "Perplexity", path: "/perplexity", price: "$0.01" },
                { name: "Brave Search", path: "/brave", price: "$0.001-$0.005" },
                { name: "DeepSeek", path: "/deepseek", price: "$0.005" },
                { name: "Resend", path: "/resend", price: "$0.005" },
                { name: "Together AI", path: "/together", price: "$0.001-$0.02" },
                { name: "ElevenLabs", path: "/elevenlabs", price: "$0.02-$0.05" },
                { name: "OpenWeather", path: "/openweather", price: "$0.001" },
                { name: "Google Maps", path: "/googlemaps", price: "$0.005" },
                { name: "Judge0", path: "/judge0", price: "$0.002" },
                { name: "Reloadly", path: "/reloadly", price: "$0.01+" },
                { name: "Lob", path: "/lob", price: "$0.01-$0.50" },
              ],
            }, null, 2),
          },
        ],
      }),
    },
  ];
}
