import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AgentTicker from "@/components/AgentTicker";
import Accounts from "@/components/Accounts";
import HowItWorks from "@/components/HowItWorks";
import LiveDemo from "@/components/LiveDemo";
import Ecosystem from "@/components/Ecosystem";
import WhyCanton from "@/components/WhyCanton";
import Numbers from "@/components/Numbers";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <AgentTicker />
        <Accounts />
        <HowItWorks />
        {/* Live Demo — Interactive Canton DevNet scenarios */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl">
              Try CAYPO
            </h2>
            <p className="text-sm text-muted mt-4 max-w-lg mx-auto">
              Select a financial scenario. Each demo runs real Canton transactions — verifiable on ccview.io.
            </p>
          </div>
          <LiveDemo />
          <p className="text-center text-xs text-muted mt-6 font-[family-name:var(--font-geist-mono)]">
            Real transactions on Canton DevNet · Verifiable on ccview.io · ~1s per demo
          </p>
        </section>
        <Ecosystem />
        <WhyCanton />
        <Numbers />

        {/* Open Source CTA */}
        <section className="py-24 px-6 text-center">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl mb-4">
            Open source. Non-custodial. Built for Canton.
          </h2>
          <p className="text-muted max-w-xl mx-auto mb-10">
            CAYPO is 100% open-source under Apache 2.0 / MIT dual license.
            Every package is on npm. Every line of code is on GitHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/anilkaracay/Caypo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Star on GitHub
            </a>
            <a
              href="https://www.npmjs.com/org/caypo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-border rounded-lg text-muted hover:text-foreground hover:border-border-hover transition-colors"
            >
              View on npm
            </a>
            <a
              href="/docs"
              className="px-6 py-3 border border-border rounded-lg text-muted hover:text-foreground hover:border-border-hover transition-colors"
            >
              Read the Docs
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
