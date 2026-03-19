const COLUMNS = [
  {
    heading: "Resources",
    links: [
      { label: "Service Catalog", href: "/gateway#services", external: false },
      { label: "API Reference", href: "/gateway#services", external: false },
      { label: "llms.txt", href: "https://mpp.caypo.xyz/llms.txt", external: true },
    ],
  },
  {
    heading: "Developers",
    links: [
      {
        label: "npm Packages",
        href: "https://npmjs.com/org/caypo",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/anilkaracay/Caypo",
        external: true,
      },
      { label: "CLI Docs", href: "/gateway#services", external: false },
    ],
  },
  {
    heading: "Links",
    links: [
      { label: "caypo.xyz", href: "/", external: false },
      {
        label: "Canton Network",
        href: "https://canton.network",
        external: true,
      },
      { label: "mpp.dev", href: "https://mpp.dev", external: true },
    ],
  },
];

export default function GatewayFooter() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Left */}
        <div>
          <p className="font-[family-name:var(--font-instrument-serif)] text-lg">
            CAYPO Gateway
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-xs text-muted mt-1">
            mpp.caypo.xyz
          </p>
          <p className="text-xs text-muted mt-0.5">Powered by Canton Network</p>
        </div>

        {/* Right — 3 columns */}
        <div className="flex gap-12">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs uppercase tracking-wide text-muted mb-3">
                {col.heading}
              </p>
              {col.links.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted hover:text-foreground block py-1 transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted hover:text-foreground block py-1 transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border text-xs text-muted">
        &copy; 2026 Cayvox Labs. Apache 2.0 / MIT.
      </div>
    </footer>
  );
}
