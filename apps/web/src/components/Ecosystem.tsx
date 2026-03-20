import { SERVICES } from "@/lib/constants";

const AI_PLATFORMS = [
  { name: "Claude Code", badge: "Agent Skills", color: "emerald" as const },
  { name: "Claude Desktop", badge: "MCP Server", color: "blue" as const },
  { name: "Cursor", badge: "MCP Server", color: "blue" as const },
  { name: "OpenAI Codex", badge: "Agent Skills", color: "emerald" as const },
  { name: "GitHub Copilot", badge: "Agent Skills", color: "emerald" as const },
  { name: "Windsurf", badge: "MCP Server", color: "blue" as const },
];

const BADGE_STYLES = {
  blue: "bg-[rgba(59,130,246,0.1)] text-accent",
  emerald: "bg-[rgba(16,185,129,0.1)] text-emerald",
  purple: "bg-[rgba(168,85,247,0.1)] text-purple-400",
};

const SERVICE_CATEGORIES = [
  {
    label: "LLMs",
    items: ["OpenAI", "Anthropic", "Google Gemini", "Groq", "DeepSeek", "Together AI", "Perplexity"],
  },
  {
    label: "Media",
    items: ["fal.ai", "ElevenLabs"],
  },
  {
    label: "Search",
    items: ["Brave Search", "Firecrawl"],
  },
  {
    label: "Tools",
    items: ["Resend", "OpenWeather", "Google Maps", "Judge0", "Reloadly", "Lob"],
  },
];

export default function Ecosystem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-5 gap-12">
          {/* Left column — 3 cols */}
          <div className="lg:col-span-3 mb-12 lg:mb-0">
            <h2 className="text-2xl font-semibold text-foreground mb-8">
              Works with every AI platform
            </h2>
            <div>
              {AI_PLATFORMS.map((platform, i) => (
                <div
                  key={platform.name}
                  className={`flex items-center gap-3 py-3 ${
                    i < AI_PLATFORMS.length - 1
                      ? "border-b border-border/50"
                      : ""
                  }`}
                >
                  <span className="text-emerald text-sm">&#10003;</span>
                  <span className="font-medium text-foreground text-sm flex-1">
                    {platform.name}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full ${BADGE_STYLES[platform.color]}`}
                  >
                    {platform.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — 2 cols */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1">
              GATEWAY
            </p>
            <p className="text-2xl font-[family-name:var(--font-geist-mono)] font-bold text-foreground">
              17 services
            </p>
            <p className="text-muted mb-6">46 endpoints</p>

            {SERVICE_CATEGORIES.map((category) => (
              <div key={category.label} className="mb-4">
                <p className="text-xs text-muted uppercase tracking-wide mb-2">
                  {category.label}
                </p>
                <p className="text-sm text-muted">
                  {category.items.join(" \u00B7 ")}
                </p>
              </div>
            ))}

            <a
              href="/gateway#services"
              className="inline-block mt-4 text-sm text-accent hover:underline"
            >
              View all services &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
