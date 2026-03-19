/**
 * Service catalog — all 17 services, 46+ endpoints.
 */

export interface EndpointDef {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  price: string; // USDCx amount
}

export interface ServiceDef {
  name: string;
  slug: string;
  description: string;
  categories: string[];
  upstreamBaseUrl: string;
  apiKeyEnvVar: string;
  apiKeyHeader: string;
  endpoints: EndpointDef[];
}

export const services: ServiceDef[] = [
  {
    name: "OpenAI",
    slug: "openai",
    description: "GPT chat completions, embeddings, image generation, transcription, speech",
    categories: ["ai", "llm", "images", "audio"],
    upstreamBaseUrl: "https://api.openai.com",
    apiKeyEnvVar: "OPENAI_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/v1/chat/completions", description: "Chat completions", price: "0.01" },
      { method: "POST", path: "/v1/embeddings", description: "Text embeddings", price: "0.001" },
      { method: "POST", path: "/v1/images/generations", description: "Image generation", price: "0.05" },
      { method: "POST", path: "/v1/audio/transcriptions", description: "Audio transcription", price: "0.01" },
      { method: "POST", path: "/v1/audio/speech", description: "Text to speech", price: "0.02" },
    ],
  },
  {
    name: "Anthropic",
    slug: "anthropic",
    description: "Claude messages API",
    categories: ["ai", "llm"],
    upstreamBaseUrl: "https://api.anthropic.com",
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    apiKeyHeader: "x-api-key",
    endpoints: [
      { method: "POST", path: "/v1/messages", description: "Create message", price: "0.01" },
    ],
  },
  {
    name: "fal.ai",
    slug: "fal",
    description: "Image generation, audio processing, video generation",
    categories: ["ai", "images", "audio", "video"],
    upstreamBaseUrl: "https://fal.run",
    apiKeyEnvVar: "FAL_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/fal-ai/flux/dev", description: "Flux image generation", price: "0.02" },
      { method: "POST", path: "/fal-ai/stable-diffusion-v3", description: "Stable Diffusion v3", price: "0.01" },
      { method: "POST", path: "/fal-ai/whisper", description: "Whisper transcription", price: "0.01" },
      { method: "POST", path: "/fal-ai/kling-video", description: "Video generation", price: "0.10" },
      { method: "POST", path: "/fal-ai/f5-tts", description: "Text to speech", price: "0.01" },
    ],
  },
  {
    name: "Firecrawl",
    slug: "firecrawl",
    description: "Web scraping, crawling, extraction",
    categories: ["data", "scraping"],
    upstreamBaseUrl: "https://api.firecrawl.dev",
    apiKeyEnvVar: "FIRECRAWL_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/v1/scrape", description: "Scrape a URL", price: "0.005" },
      { method: "POST", path: "/v1/crawl", description: "Crawl a site", price: "0.02" },
      { method: "POST", path: "/v1/map", description: "Map site structure", price: "0.005" },
      { method: "POST", path: "/v1/extract", description: "Extract structured data", price: "0.01" },
    ],
  },
  {
    name: "Google Gemini",
    slug: "gemini",
    description: "Gemini chat, reasoning, embeddings",
    categories: ["ai", "llm"],
    upstreamBaseUrl: "https://generativelanguage.googleapis.com",
    apiKeyEnvVar: "GEMINI_API_KEY",
    apiKeyHeader: "x-goog-api-key",
    endpoints: [
      { method: "POST", path: "/v1beta/models/gemini-pro:generateContent", description: "Chat", price: "0.005" },
      { method: "POST", path: "/v1beta/models/gemini-pro:streamGenerateContent", description: "Reasoning", price: "0.02" },
      { method: "POST", path: "/v1beta/models/text-embedding-004:embedContent", description: "Embeddings", price: "0.005" },
    ],
  },
  {
    name: "Groq",
    slug: "groq",
    description: "Fast LLM inference",
    categories: ["ai", "llm"],
    upstreamBaseUrl: "https://api.groq.com",
    apiKeyEnvVar: "GROQ_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/openai/v1/chat/completions", description: "Chat completions", price: "0.001" },
      { method: "POST", path: "/openai/v1/embeddings", description: "Embeddings", price: "0.005" },
    ],
  },
  {
    name: "Perplexity",
    slug: "perplexity",
    description: "Chat with real-time web search",
    categories: ["ai", "search"],
    upstreamBaseUrl: "https://api.perplexity.ai",
    apiKeyEnvVar: "PERPLEXITY_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/chat/completions", description: "Chat with search", price: "0.01" },
    ],
  },
  {
    name: "Brave Search",
    slug: "brave",
    description: "Web, image, news, video search",
    categories: ["search"],
    upstreamBaseUrl: "https://api.search.brave.com",
    apiKeyEnvVar: "BRAVE_API_KEY",
    apiKeyHeader: "X-Subscription-Token",
    endpoints: [
      { method: "GET", path: "/res/v1/web/search", description: "Web search", price: "0.001" },
      { method: "GET", path: "/res/v1/images/search", description: "Image search", price: "0.002" },
      { method: "GET", path: "/res/v1/news/search", description: "News search", price: "0.002" },
      { method: "GET", path: "/res/v1/videos/search", description: "Video search", price: "0.002" },
      { method: "GET", path: "/res/v1/suggest/search", description: "Search suggestions", price: "0.001" },
    ],
  },
  {
    name: "DeepSeek",
    slug: "deepseek",
    description: "DeepSeek chat API",
    categories: ["ai", "llm"],
    upstreamBaseUrl: "https://api.deepseek.com",
    apiKeyEnvVar: "DEEPSEEK_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/chat/completions", description: "Chat completions", price: "0.005" },
    ],
  },
  {
    name: "Resend",
    slug: "resend",
    description: "Email sending API",
    categories: ["communication"],
    upstreamBaseUrl: "https://api.resend.com",
    apiKeyEnvVar: "RESEND_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/emails", description: "Send email", price: "0.005" },
      { method: "POST", path: "/emails/batch", description: "Batch send", price: "0.005" },
    ],
  },
  {
    name: "Together AI",
    slug: "together",
    description: "Open-source model inference",
    categories: ["ai", "llm", "images"],
    upstreamBaseUrl: "https://api.together.xyz",
    apiKeyEnvVar: "TOGETHER_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/v1/chat/completions", description: "Chat completions", price: "0.001" },
      { method: "POST", path: "/v1/embeddings", description: "Embeddings", price: "0.001" },
      { method: "POST", path: "/v1/images/generations", description: "Image generation", price: "0.02" },
    ],
  },
  {
    name: "ElevenLabs",
    slug: "elevenlabs",
    description: "Text to speech, voice cloning",
    categories: ["audio", "ai"],
    upstreamBaseUrl: "https://api.elevenlabs.io",
    apiKeyEnvVar: "ELEVENLABS_API_KEY",
    apiKeyHeader: "xi-api-key",
    endpoints: [
      { method: "POST", path: "/v1/text-to-speech/:voice_id", description: "Text to speech", price: "0.02" },
      { method: "POST", path: "/v1/voice-generation/generate-voice", description: "Voice clone", price: "0.05" },
    ],
  },
  {
    name: "OpenWeather",
    slug: "openweather",
    description: "Weather data API",
    categories: ["data", "weather"],
    upstreamBaseUrl: "https://api.openweathermap.org",
    apiKeyEnvVar: "OPENWEATHER_API_KEY",
    apiKeyHeader: "appid",
    endpoints: [
      { method: "GET", path: "/data/2.5/weather", description: "Current weather", price: "0.001" },
      { method: "GET", path: "/data/2.5/forecast", description: "5-day forecast", price: "0.001" },
    ],
  },
  {
    name: "Google Maps",
    slug: "googlemaps",
    description: "Geocoding, places, directions",
    categories: ["data", "maps"],
    upstreamBaseUrl: "https://maps.googleapis.com",
    apiKeyEnvVar: "GOOGLE_MAPS_API_KEY",
    apiKeyHeader: "key",
    endpoints: [
      { method: "GET", path: "/maps/api/geocode/json", description: "Geocode address", price: "0.005" },
      { method: "GET", path: "/maps/api/place/nearbysearch/json", description: "Nearby places", price: "0.005" },
      { method: "GET", path: "/maps/api/directions/json", description: "Directions", price: "0.005" },
    ],
  },
  {
    name: "Judge0",
    slug: "judge0",
    description: "Code execution engine",
    categories: ["developer"],
    upstreamBaseUrl: "https://judge0-ce.p.rapidapi.com",
    apiKeyEnvVar: "JUDGE0_API_KEY",
    apiKeyHeader: "X-RapidAPI-Key",
    endpoints: [
      { method: "POST", path: "/submissions", description: "Execute code", price: "0.002" },
      { method: "GET", path: "/languages", description: "List languages", price: "0.002" },
    ],
  },
  {
    name: "Reloadly",
    slug: "reloadly",
    description: "Gift cards API",
    categories: ["commerce"],
    upstreamBaseUrl: "https://giftcards.reloadly.com",
    apiKeyEnvVar: "RELOADLY_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "GET", path: "/products", description: "List gift cards", price: "0.01" },
      { method: "POST", path: "/orders", description: "Purchase gift card", price: "0.01" },
    ],
  },
  {
    name: "Lob",
    slug: "lob",
    description: "Physical mail — postcards, letters, address verification",
    categories: ["communication", "mail"],
    upstreamBaseUrl: "https://api.lob.com",
    apiKeyEnvVar: "LOB_API_KEY",
    apiKeyHeader: "Authorization",
    endpoints: [
      { method: "POST", path: "/v1/postcards", description: "Send postcard", price: "0.50" },
      { method: "POST", path: "/v1/letters", description: "Send letter", price: "0.50" },
      { method: "POST", path: "/us_verifications", description: "Verify address", price: "0.01" },
    ],
  },
];

export const totalEndpoints = services.reduce((sum, s) => sum + s.endpoints.length, 0);
