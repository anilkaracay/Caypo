const AI_PLATFORMS = [
  { name: "Claude Code", badge: "Agent Skills", color: "emerald" as const, icon: "anthropic" },
  { name: "Claude Desktop", badge: "MCP Server", color: "blue" as const, icon: "anthropic" },
  { name: "Cursor", badge: "MCP Server", color: "blue" as const, icon: "cursor" },
  { name: "OpenAI Codex", badge: "Agent Skills", color: "emerald" as const, icon: "openai" },
  { name: "GitHub Copilot", badge: "Agent Skills", color: "emerald" as const, icon: "github" },
  { name: "Windsurf", badge: "MCP Server", color: "blue" as const, icon: "windsurf" },
];

const BADGE_STYLES = {
  blue: "bg-[rgba(59,130,246,0.1)] text-accent",
  emerald: "bg-[rgba(16,185,129,0.1)] text-emerald",
};

// SVG paths from simple-icons (24x24 viewBox)
const BRAND_ICONS: Record<string, { path: string; color: string }> = {
  anthropic: { path: "M17.308 3.147L12.57 20.853h-2.862l4.738-17.706h2.862zM6.692 3.147h2.862l4.738 17.706h-2.862L6.692 3.147z", color: "#D4A27F" },
  openai: { path: "M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z", color: "#74AA9C" },
  github: { path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", color: "#F8FAFC" },
};

// Letter avatar for services without brand icons
function LetterAvatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {name[0]}
    </div>
  );
}

function BrandIcon({ id }: { id: string }) {
  const icon = BRAND_ICONS[id];
  if (!icon) {
    const colors: Record<string, string> = {
      cursor: "#3B82F6", windsurf: "#06B6D4",
    };
    return <LetterAvatar name={id} color={colors[id] || "#94A3B8"} />;
  }
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill={icon.color}>
      <path d={icon.path} />
    </svg>
  );
}

// Service data with categories
const SERVICE_GRID = [
  { name: "OpenAI", icon: "openai", cat: "LLM" },
  { name: "Anthropic", icon: "anthropic", cat: "LLM" },
  { name: "Gemini", icon: null, cat: "LLM" },
  { name: "Groq", icon: null, cat: "LLM" },
  { name: "DeepSeek", icon: null, cat: "LLM" },
  { name: "Together", icon: null, cat: "LLM" },
  { name: "Perplexity", icon: null, cat: "Search" },
  { name: "Brave", icon: null, cat: "Search" },
  { name: "Firecrawl", icon: null, cat: "Search" },
  { name: "fal.ai", icon: null, cat: "Media" },
  { name: "ElevenLabs", icon: null, cat: "Media" },
  { name: "Resend", icon: null, cat: "Tools" },
  { name: "Weather", icon: null, cat: "Tools" },
  { name: "Maps", icon: null, cat: "Tools" },
  { name: "Judge0", icon: null, cat: "Tools" },
  { name: "Reloadly", icon: null, cat: "Tools" },
  { name: "Lob", icon: null, cat: "Tools" },
];

const CAT_COLORS: Record<string, string> = {
  LLM: "#3B82F6",
  Search: "#A855F7",
  Media: "#F59E0B",
  Tools: "#10B981",
};

function ServiceCard({ name, icon, cat }: { name: string; icon: string | null; cat: string }) {
  const color = CAT_COLORS[cat] || "#94A3B8";
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2.5 flex items-center gap-2.5 hover:border-[rgba(59,130,246,0.3)] transition-colors group">
      {icon && BRAND_ICONS[icon] ? (
        <svg className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill={BRAND_ICONS[icon].color}>
          <path d={BRAND_ICONS[icon].path} />
        </svg>
      ) : (
        <LetterAvatar name={name} color={color} />
      )}
      <span className="text-xs text-muted group-hover:text-foreground transition-colors">{name}</span>
    </div>
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
                  <BrandIcon id={platform.icon} />
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
                <ServiceCard key={s.name} {...s} />
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
