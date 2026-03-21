import {
  AnthropicIcon, CursorIcon, OpenAIIcon, GitHubIcon, CodeiumIcon,
  GeminiIcon, GroqIcon, DeepSeekIcon, PerplexityIcon, BraveIcon,
  ElevenLabsIcon, GoogleMapsIcon, LetterIcon,
} from "./BrandIcons";

const AI_PLATFORMS = [
  { name: "Claude Code", badge: "Agent Skills", color: "emerald" as const, Icon: AnthropicIcon },
  { name: "Claude Desktop", badge: "MCP Server", color: "blue" as const, Icon: AnthropicIcon },
  { name: "Cursor", badge: "MCP Server", color: "blue" as const, Icon: CursorIcon },
  { name: "OpenAI Codex", badge: "Agent Skills", color: "emerald" as const, Icon: OpenAIIcon },
  { name: "GitHub Copilot", badge: "Agent Skills", color: "emerald" as const, Icon: GitHubIcon },
  { name: "Windsurf", badge: "MCP Server", color: "blue" as const, Icon: CodeiumIcon },
];

const BADGE_STYLES = {
  blue: "bg-[rgba(59,130,246,0.1)] text-accent",
  emerald: "bg-[rgba(16,185,129,0.1)] text-emerald",
};

const SERVICE_GRID = [
  { name: "OpenAI", icon: <OpenAIIcon size={16} /> },
  { name: "Anthropic", icon: <AnthropicIcon size={16} /> },
  { name: "Gemini", icon: <GeminiIcon size={16} /> },
  { name: "Groq", icon: <GroqIcon size={16} /> },
  { name: "DeepSeek", icon: <DeepSeekIcon size={16} /> },
  { name: "Together", icon: <LetterIcon letter="T" color="#6366F1" size={16} /> },
  { name: "Perplexity", icon: <PerplexityIcon size={16} /> },
  { name: "Brave", icon: <BraveIcon size={16} /> },
  { name: "Firecrawl", icon: <LetterIcon letter="F" color="#FF6B35" size={16} /> },
  { name: "fal.ai", icon: <LetterIcon letter="f" color="#8B5CF6" size={16} /> },
  { name: "ElevenLabs", icon: <ElevenLabsIcon size={16} /> },
  { name: "Resend", icon: <LetterIcon letter="R" color="#FFFFFF" size={16} /> },
  { name: "Weather", icon: <LetterIcon letter="W" color="#EB6E4B" size={16} /> },
  { name: "Maps", icon: <GoogleMapsIcon size={16} /> },
  { name: "Judge0", icon: <LetterIcon letter="J" color="#22C55E" size={16} /> },
  { name: "Reloadly", icon: <LetterIcon letter="R" color="#3B82F6" size={16} /> },
  { name: "Lob", icon: <LetterIcon letter="L" color="#EC4899" size={16} /> },
];

export default function Ecosystem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 mb-12 lg:mb-0">
            <h2 className="text-2xl font-semibold text-foreground mb-8">
              Works with every AI platform
            </h2>
            <div>
              {AI_PLATFORMS.map((p, i) => (
                <div key={p.name} className={`flex items-center gap-3 py-3 ${i < AI_PLATFORMS.length - 1 ? "border-b border-border/50" : ""}`}>
                  <p.Icon size={20} />
                  <span className="font-medium text-foreground text-sm flex-1">{p.name}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${BADGE_STYLES[p.color]}`}>{p.badge}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-1">GATEWAY</p>
            <p className="text-2xl font-[family-name:var(--font-geist-mono)] font-bold text-foreground">17 services</p>
            <p className="text-muted mb-6">46 endpoints</p>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_GRID.map((s) => (
                <div key={s.name} className="bg-surface border border-border rounded-lg px-3 py-2.5 flex items-center gap-2.5 hover:border-[rgba(59,130,246,0.3)] transition-colors group">
                  <span className="shrink-0">{s.icon}</span>
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
