const npmSdk = "https://www.npmjs.com/package/@caypo/canton-sdk";
const npmCli = "https://www.npmjs.com/package/@caypo/canton-cli";
const npmMcp = "https://www.npmjs.com/package/@caypo/canton-mcp";
const npmOrg = "https://www.npmjs.com/org/caypo";
const githubRepo = "https://github.com/anilkaracay/Caypo";

const LINKS = {
  Products: [
    { label: "SDK", href: npmSdk },
    { label: "CLI", href: npmCli },
    { label: "MCP Server", href: npmMcp },
    { label: "Gateway", href: "/gateway" },
  ],
  Developers: [
    { label: "Docs", href: "/docs" },
    { label: "npm Packages", href: npmOrg },
    { label: "API Reference", href: "/docs#api" },
    { label: "Agent Skills", href: githubRepo + "/tree/main/skills" },
  ],
  Community: [
    { label: "GitHub", href: githubRepo },
    { label: "X (Twitter)", href: "#" },
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
              Agent finance on institutional rails
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
