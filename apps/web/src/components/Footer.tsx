const LINKS = {
  Products: [
    { label: "SDK", href: "/docs/sdk" },
    { label: "CLI", href: "/docs/cli" },
    { label: "MCP Server", href: "/docs/mcp" },
    { label: "Gateway", href: "/docs/gateway" },
  ],
  Developers: [
    { label: "Docs", href: "/docs" },
    { label: "npm", href: "https://www.npmjs.com/org/caypo" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Skills", href: "/docs/skills" },
  ],
  Community: [
    { label: "GitHub", href: "https://github.com/cayvox-labs/caypo" },
    { label: "X", href: "https://x.com/cayvoxlabs" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-xl text-foreground mb-2">CAYPO</p>
            <p className="text-sm text-muted leading-relaxed max-w-[200px]">
              A bank account for AI agents on Canton Network.
            </p>
          </div>

          {/* Link columns */}
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

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            © 2026 Cayvox Labs. Apache 2.0 / MIT.
          </p>
          <p className="text-xs text-muted">
            Built on{" "}
            <a
              href="https://canton.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Canton Network
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
