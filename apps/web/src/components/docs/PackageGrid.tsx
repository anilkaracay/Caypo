import { PACKAGES } from "@/lib/docs-data";

export default function PackageGrid() {
  return (
    <div>
      <p className="font-[family-name:var(--font-geist-mono)] text-sm text-muted mb-1">
        5 packages on npm
      </p>
      <p className="font-[family-name:var(--font-geist-mono)] text-xs text-muted mb-8">
        Install any package:{" "}
        <code className="text-foreground">npm install @caypo/canton-sdk</code>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PACKAGES.map((pkg, index) => {
          const colSpanClass =
            index === 0
              ? "md:col-span-2 md:row-span-2"
              : index === 1
              ? "md:row-span-2"
              : "";

          return (
            <div
              key={pkg.name}
              className={`bg-surface border border-border rounded-xl p-6 hover:border-blue-500/30 transition-all group ${colSpanClass}`}
            >
              <div className="flex items-center">
                <span className="font-[family-name:var(--font-geist-mono)] text-sm font-medium text-blue-400">
                  {pkg.name}
                </span>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full ml-2 inline">
                  {pkg.shortName}
                </span>
              </div>

              <p className="text-sm text-muted mt-2">{pkg.description}</p>

              <div className="mt-3 bg-[#0a0a0a] rounded-lg px-3 py-2 font-[family-name:var(--font-geist-mono)] text-xs text-muted overflow-x-auto">
                {pkg.importExample}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {pkg.keyFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="text-[11px] bg-surface-hover px-2 py-0.5 rounded text-muted"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href={pkg.npm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-blue-400 transition-colors"
                >
                  npm
                </a>
                <a
                  href={pkg.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted hover:text-blue-400 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
