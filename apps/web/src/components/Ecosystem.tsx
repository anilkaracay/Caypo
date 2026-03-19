import { SERVICES } from "@/lib/constants";

const AI_PLATFORMS = [
  { name: "Claude Code", type: "MCP + Skills" },
  { name: "Claude Desktop", type: "MCP Server" },
  { name: "Cursor", type: "MCP Server" },
  { name: "OpenAI Codex", type: "SDK + CLI" },
  { name: "GitHub Copilot", type: "Skills" },
  { name: "Windsurf", type: "MCP Server" },
];

export default function Ecosystem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="text-sm text-accent font-mono mb-3">Ecosystem</p>
          <h2 className="font-display text-4xl lg:text-5xl text-foreground tracking-tight">
            Plug into every platform
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: AI platforms */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-6">
              Works with every AI platform
            </h3>
            <ul className="flex flex-col gap-3">
              {AI_PLATFORMS.map((platform) => (
                <li
                  key={platform.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald text-base leading-none">✓</span>
                    <span className="text-sm text-foreground font-medium">
                      {platform.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted font-mono">{platform.type}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Gateway services */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Gateway Services
            </h3>
            <p className="text-sm text-muted mb-6">
              <span className="font-mono text-foreground">mpp.caypo.xyz</span>
              {" "}— 17 services, 46 endpoints
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {SERVICES.map((service) => (
                <div
                  key={service}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted font-mono text-center"
                >
                  {service}
                </div>
              ))}
            </div>

            <a
              href="/docs/gateway"
              className="text-sm text-accent hover:underline transition-colors"
            >
              View all services →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
