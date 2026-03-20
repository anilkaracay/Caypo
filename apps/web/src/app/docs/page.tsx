import Header from "@/components/Header";
import DocsHero from "@/components/docs/DocsHero";
import QuickStart from "@/components/docs/QuickStart";
import PackageGrid from "@/components/docs/PackageGrid";
import APIReference from "@/components/docs/APIReference";
import CantonPrimer from "@/components/docs/CantonPrimer";
import Resources from "@/components/docs/Resources";

export const metadata = {
  title: "CAYPO Docs — Build with AI Agent Banking on Canton",
  description: "Documentation, API references, and integration guides for CAYPO. 5 npm packages, 35 MCP tools, 36 CLI commands.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <DocsHero />
      <section id="quickstart" className="py-16 px-6 max-w-5xl mx-auto">
        <QuickStart />
      </section>
      <section id="packages" className="py-16 px-6 max-w-5xl mx-auto">
        <PackageGrid />
      </section>
      <section id="api" className="py-16 px-6 max-w-5xl mx-auto">
        <APIReference />
      </section>
      <section id="canton" className="py-16 px-6 max-w-5xl mx-auto">
        <CantonPrimer />
      </section>
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <Resources />
      </section>
      <footer className="border-t border-border py-8 px-6 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
        <span className="font-[family-name:var(--font-instrument-serif)] text-sm text-foreground">CAYPO Docs</span>
        <div className="flex gap-6">
          <a href="/" className="hover:text-foreground transition-colors">caypo.xyz</a>
          <a href="/gateway" className="hover:text-foreground transition-colors">Gateway</a>
          <a href="https://github.com/anilkaracay/Caypo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="https://www.npmjs.com/org/caypo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">npm</a>
        </div>
        <span>© 2026 Cayvox Labs · Apache 2.0 / MIT</span>
      </footer>
    </div>
  );
}
