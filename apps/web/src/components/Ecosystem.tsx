const LH = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";

const AI_PLATFORMS = [
  { name: "Claude Code", badge: "Agent Skills", color: "emerald" as const, logo: `${LH}/anthropic.svg` },
  { name: "Claude Desktop", badge: "MCP Server", color: "blue" as const, logo: `${LH}/anthropic.svg` },
  { name: "Cursor", badge: "MCP Server", color: "blue" as const, logo: `${LH}/cursor.svg` },
  { name: "OpenAI Codex", badge: "Agent Skills", color: "emerald" as const, logo: `${LH}/openai.svg` },
  { name: "GitHub Copilot", badge: "Agent Skills", color: "emerald" as const, logo: `${LH}/github.svg` },
  { name: "Windsurf", badge: "MCP Server", color: "blue" as const, logo: `${LH}/codeium.svg` },
];

const BADGE_STYLES = {
  blue: "bg-[rgba(59,130,246,0.1)] text-accent",
  emerald: "bg-[rgba(16,185,129,0.1)] text-emerald",
};

const SERVICE_GRID: Array<{ name: string; logo: string | null; letter: string; letterColor: string; cat: string }> = [
  { name: "OpenAI", logo: `${LH}/openai.svg`, letter: "O", letterColor: "#74AA9C", cat: "LLM" },
  { name: "Anthropic", logo: `${LH}/anthropic.svg`, letter: "A", letterColor: "#D4A27F", cat: "LLM" },
  { name: "Gemini", logo: `${LH}/gemini.svg`, letter: "G", letterColor: "#8E75B2", cat: "LLM" },
  { name: "Groq", logo: `${LH}/groq.svg`, letter: "G", letterColor: "#F55036", cat: "LLM" },
  { name: "DeepSeek", logo: `${LH}/deepseek.svg`, letter: "D", letterColor: "#4D6BFE", cat: "LLM" },
  { name: "Together", logo: `${LH}/together-ai.svg`, letter: "T", letterColor: "#3B82F6", cat: "LLM" },
  { name: "Perplexity", logo: `${LH}/perplexity.svg`, letter: "P", letterColor: "#20B8CD", cat: "Search" },
  { name: "Brave", logo: "https://cdn.simpleicons.org/brave/FB542B", letter: "B", letterColor: "#FB542B", cat: "Search" },
  { name: "Firecrawl", logo: null, letter: "F", letterColor: "#F97316", cat: "Search" },
  { name: "fal.ai", logo: `${LH}/fal.svg`, letter: "f", letterColor: "#A855F7", cat: "Media" },
  { name: "ElevenLabs", logo: `${LH}/elevenlabs.svg`, letter: "E", letterColor: "#FFFFFF", cat: "Media" },
  { name: "Resend", logo: null, letter: "R", letterColor: "#94A3B8", cat: "Tools" },
  { name: "Weather", logo: null, letter: "W", letterColor: "#EB6E4B", cat: "Tools" },
  { name: "Maps", logo: "https://cdn.simpleicons.org/googlemaps/4285F4", letter: "M", letterColor: "#4285F4", cat: "Tools" },
  { name: "Judge0", logo: null, letter: "J", letterColor: "#10B981", cat: "Tools" },
  { name: "Reloadly", logo: null, letter: "R", letterColor: "#3B82F6", cat: "Tools" },
  { name: "Lob", logo: null, letter: "L", letterColor: "#EC4899", cat: "Tools" },
];

function LetterAvatar({ letter, color }: { letter: string; color: string }) {
  return (
    <div
      className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {letter}
    </div>
  );
}

function ServiceIcon({ logo, letter, letterColor }: { logo: string | null; letter: string; letterColor: string }) {
  if (!logo) return <LetterAvatar letter={letter} color={letterColor} />;
  return (
    <img
      src={logo}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
      style={{ filter: "brightness(0) invert(1)" }}
    />
  );
}

export default function Ecosystem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-5 gap-12">
          {/* Left column */}
          <div className="lg:col-span-3 mb-12 lg:mb-0">
            <h2 className="text-2xl font-semibold text-foreground mb-8">
              Works with every AI platform
            </h2>
            <div>
              {AI_PLATFORMS.map((platform, i) => (
                <div
                  key={platform.name}
                  className={`flex items-center gap-3 py-3 ${
                    i < AI_PLATFORMS.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    width={20}
                    height={20}
                    loading="lazy"
                    className="w-5 h-5 shrink-0"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                  <span className="font-medium text-foreground text-sm flex-1">
                    {platform.name}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${BADGE_STYLES[platform.color]}`}>
                    {platform.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1">GATEWAY</p>
            <p className="text-2xl font-[family-name:var(--font-geist-mono)] font-bold text-foreground">17 services</p>
            <p className="text-muted mb-6">46 endpoints</p>

            <div className="grid grid-cols-2 gap-2">
              {SERVICE_GRID.map((s) => (
                <div
                  key={s.name}
                  className="bg-surface border border-border rounded-lg px-3 py-2.5 flex items-center gap-2.5 hover:border-[rgba(59,130,246,0.3)] transition-colors group"
                >
                  <ServiceIcon logo={s.logo} letter={s.letter} letterColor={s.letterColor} />
                  <span className="text-xs text-muted group-hover:text-foreground transition-colors">{s.name}</span>
                </div>
              ))}
            </div>

            <a href="/gateway#services" className="inline-block mt-6 text-sm text-accent hover:underline">
              View all services &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
