const LINKS = {
  Products: [
    { label: "SDK", href: "https://www.npmjs.com/package/@caypo/canton-sdk" },
    { label: "CLI", href: "https://www.npmjs.com/package/@caypo/canton-cli" },
    { label: "MCP Server", href: "https://www.npmjs.com/package/@caypo/canton-mcp" },
    { label: "Gateway", href: "https://www.npmjs.com/package/@caypo/canton-gateway" },
  ],
  Developers: [
    { label: "Docs", href: "/docs" },
    { label: "npm Packages", href: "https://www.npmjs.com/org/caypo" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Agent Skills", href: "/docs/skills" },
  ],
  Community: [
    { label: "GitHub", href: "https://github.com/anilkaracay/Caypo" },
    { label: "X (Twitter)", href: "https://x.com/cayvoxlabs" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto py-16 px-6">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          {/* Brand */}
          <div>
            <p className="font-[family-name:var(--font-instrument-serif)] text-xl tracking-tight text-foreground">
              CAYPO
            </p>
            <p className="text-sm text-muted mt-1 max-w-[260px]">
              A bank account for AI agents on Canton Network
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-16">
            {Object.entries(LINKS).map(([title, links]) => (
              <div key={title}>
                <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">
                  {title}
                </p>
                <ul className="flex flex-col gap-3">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                        {...(href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>&copy; 2026 Cayvox Labs</p>
          <p>Apache 2.0 / MIT</p>
        </div>
      </div>
    </footer>
  );
}
