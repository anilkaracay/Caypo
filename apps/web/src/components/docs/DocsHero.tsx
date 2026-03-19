export default function DocsHero() {
  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
      <p className="text-sm font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.15em] text-blue-400 mb-4">
        CAYPO DOCS
      </p>
      <h1 className="font-[family-name:var(--font-instrument-serif)] text-[48px] tracking-[-0.03em] leading-tight">
        Build with CAYPO
      </h1>
      <p className="text-lg text-muted mt-4 max-w-2xl">
        Documentation, API references, and integration guides for AI agent banking on Canton Network.
      </p>

      <div className="mt-8 flex items-center bg-surface border border-border rounded-xl px-4 py-3 max-w-xl">
        <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="text-muted text-sm ml-3 flex-1">Search docs...</span>
        <kbd className="text-xs text-muted bg-background px-2 py-0.5 rounded border border-border">⌘K</kbd>
      </div>

      <div className="mt-6 flex gap-3">
        <a href="#quickstart" className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-blue-500/30 transition-all">Quick Start</a>
        <a href="#packages" className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-blue-500/30 transition-all">Packages</a>
        <a href="#canton" className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-foreground hover:border-blue-500/30 transition-all">Canton</a>
      </div>

      <p className="mt-8 text-xs font-[family-name:var(--font-geist-mono)] text-muted">
        v0.2.0 · 312 tests · Apache 2.0 / MIT
      </p>
    </section>
  );
}
