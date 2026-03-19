export interface GatewayService {
  id: string;
  name: string;
  description: string;
  category: "ai" | "search" | "media" | "data" | "dev";
  endpoints: number;
  priceRange: string;
  example: string;
  baseUrl: string;
  models?: string[];
}

export const GATEWAY_SERVICES: GatewayService[] = [
  { id: "openai", name: "OpenAI", description: "GPT-4o, DALL-E 3, Whisper, TTS", category: "ai", endpoints: 8, priceRange: "$0.001-0.05", example: "Chat completion, 500 tokens", baseUrl: "mpp.caypo.xyz/openai", models: ["gpt-4o", "gpt-4o-mini", "dall-e-3", "whisper-1", "tts-1"] },
  { id: "anthropic", name: "Anthropic", description: "Claude Sonnet, Opus, Haiku", category: "ai", endpoints: 4, priceRange: "$0.001-0.015", example: "Chat completion, 500 tokens", baseUrl: "mpp.caypo.xyz/anthropic", models: ["claude-sonnet-4-20250514", "claude-opus-4-20250901", "claude-haiku-3-5-20241022"] },
  { id: "gemini", name: "Google Gemini", description: "Gemini Pro, Flash, Nano", category: "ai", endpoints: 4, priceRange: "$0.001-0.008", example: "Text generation, 500 tokens", baseUrl: "mpp.caypo.xyz/gemini", models: ["gemini-pro", "gemini-flash"] },
  { id: "groq", name: "Groq", description: "Llama 3, Mixtral — ultra-fast inference", category: "ai", endpoints: 2, priceRange: "$0.0005-0.002", example: "Chat completion, 500 tokens", baseUrl: "mpp.caypo.xyz/groq", models: ["llama-3.3-70b", "mixtral-8x7b"] },
  { id: "deepseek", name: "DeepSeek", description: "DeepSeek V3, Coder", category: "ai", endpoints: 2, priceRange: "$0.0005-0.003", example: "Chat completion, 500 tokens", baseUrl: "mpp.caypo.xyz/deepseek", models: ["deepseek-chat", "deepseek-coder"] },
  { id: "together", name: "Together AI", description: "Open-source models hosted", category: "ai", endpoints: 3, priceRange: "$0.001-0.005", example: "Inference, 500 tokens", baseUrl: "mpp.caypo.xyz/together" },
  { id: "perplexity", name: "Perplexity", description: "AI-powered web search with sources", category: "search", endpoints: 2, priceRange: "$0.005-0.01", example: "Search query with sources", baseUrl: "mpp.caypo.xyz/perplexity" },
  { id: "brave", name: "Brave Search", description: "Independent web search API", category: "search", endpoints: 2, priceRange: "$0.003", example: "Web search query", baseUrl: "mpp.caypo.xyz/brave" },
  { id: "firecrawl", name: "Firecrawl", description: "Web scraping, crawling, extraction", category: "search", endpoints: 4, priceRange: "$0.005-0.02", example: "Scrape single page", baseUrl: "mpp.caypo.xyz/firecrawl" },
  { id: "fal", name: "fal.ai", description: "FLUX, Stable Diffusion, 600+ models", category: "media", endpoints: 3, priceRange: "$0.02-0.10", example: "Image generation, 1024x1024", baseUrl: "mpp.caypo.xyz/fal", models: ["flux-pro", "flux-schnell", "stable-diffusion-xl"] },
  { id: "elevenlabs", name: "ElevenLabs", description: "Text-to-speech, voice cloning", category: "media", endpoints: 3, priceRange: "$0.01-0.05", example: "TTS, 500 characters", baseUrl: "mpp.caypo.xyz/elevenlabs" },
  { id: "openweather", name: "OpenWeather", description: "Weather data, forecasts", category: "data", endpoints: 3, priceRange: "$0.001-0.003", example: "Current weather lookup", baseUrl: "mpp.caypo.xyz/openweather" },
  { id: "googlemaps", name: "Google Maps", description: "Geocoding, directions, places", category: "data", endpoints: 4, priceRange: "$0.005-0.02", example: "Geocode address", baseUrl: "mpp.caypo.xyz/googlemaps" },
  { id: "reloadly", name: "Reloadly", description: "Airtime topup, gift cards", category: "data", endpoints: 2, priceRange: "$0.01-1.00", example: "Airtime topup", baseUrl: "mpp.caypo.xyz/reloadly" },
  { id: "resend", name: "Resend", description: "Transactional email API", category: "dev", endpoints: 2, priceRange: "$0.001-0.003", example: "Send single email", baseUrl: "mpp.caypo.xyz/resend" },
  { id: "lob", name: "Lob", description: "Physical mail, postcards, letters", category: "dev", endpoints: 3, priceRange: "$0.50-2.00", example: "Send postcard", baseUrl: "mpp.caypo.xyz/lob" },
  { id: "judge0", name: "Judge0", description: "Code execution, 70+ languages", category: "dev", endpoints: 2, priceRange: "$0.001-0.005", example: "Execute Python script", baseUrl: "mpp.caypo.xyz/judge0" },
];

export const CATEGORIES: Record<string, { label: string; count: number }> = {
  ai: { label: "AI Models", count: 6 },
  search: { label: "Search & Web", count: 3 },
  media: { label: "Media", count: 2 },
  data: { label: "Data", count: 3 },
  dev: { label: "Dev Tools", count: 3 },
};
