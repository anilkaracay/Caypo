import { RESOURCES } from "@/lib/docs-data";

export default function Resources() {
  return (
    <div>
      <h2 className="text-2xl font-medium">Resources</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {RESOURCES.map((resource) => {
          const isExternal = resource.url.startsWith("http");
          return (
            <div
              key={resource.title}
              className="bg-surface border border-border rounded-xl p-5 hover:border-blue-500/30 transition-all"
            >
              <p className="text-sm font-medium text-foreground">
                {resource.title}
              </p>
              <p className="font-[family-name:var(--font-geist-mono)] text-xs text-muted mt-1">
                {resource.detail}
              </p>
              <p className="text-sm text-muted mt-2">{resource.description}</p>
              {isExternal ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 block"
                >
                  Open →
                </a>
              ) : (
                <a
                  href={resource.url}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 block"
                >
                  Open →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
