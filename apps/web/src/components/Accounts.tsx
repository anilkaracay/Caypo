"use client";

import { motion } from "framer-motion";
import { ACCOUNTS } from "@/lib/constants";

const CARD_ACCENTS: Record<string, { text: string; border: string; shadow: string }> = {
  checking: { text: "text-accent", border: "border-accent/40", shadow: "0 0 24px rgba(59,130,246,0.15)" },
  savings: { text: "text-emerald", border: "border-emerald/40", shadow: "0 0 24px rgba(16,185,129,0.15)" },
  credit: { text: "text-amber-400", border: "border-amber-400/40", shadow: "0 0 24px rgba(251,191,36,0.15)" },
  exchange: { text: "text-purple-400", border: "border-purple-400/40", shadow: "0 0 24px rgba(168,85,247,0.15)" },
  investment: { text: "text-accent", border: "border-accent/40", shadow: "0 0 24px rgba(59,130,246,0.15)" },
};

const SDK_CODE = `const agent = await CantonAgent.create();
await agent.mpp.pay("https://mpp.caypo.xyz/openai/...", {
  maxPrice: "0.05"
});
// → 402 → USDCx transfer → 200 OK`;

function CheckingCard() {
  const account = ACCOUNTS[0];
  const accent = CARD_ACCENTS.checking;
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: accent.shadow }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-surface border border-border rounded-xl p-6 md:col-span-2 hover:border-accent/40 transition-colors duration-200"
    >
      <p className={`text-sm font-medium ${accent.text} mb-1`}>{account.name}</p>
      <p className="text-sm text-muted mb-4">{account.tagline}</p>
      <div className="bg-[#0a0a0a] rounded-lg p-4 font-[family-name:var(--font-geist-mono)] text-[13px] text-blue-400 mb-4 overflow-x-auto">
        <pre className="whitespace-pre leading-relaxed">{SDK_CODE}</pre>
      </div>
      <div className="flex flex-wrap gap-3">
        {account.metrics.map((m) => (
          <div key={m.label} className="bg-background rounded-lg px-3 py-2 border border-border">
            <p className="text-xs text-muted">{m.label}</p>
            <p className="text-sm font-[family-name:var(--font-geist-mono)] text-foreground font-medium">{m.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SavingsCard() {
  const account = ACCOUNTS[1];
  const accent = CARD_ACCENTS.savings;
  const apyMetric = account.metrics.find((m) => m.label === "APY");
  const deposited = account.metrics.find((m) => m.label === "Deposited");
  const earned = account.metrics.find((m) => m.label.includes("Earned"));
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: accent.shadow }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-surface border border-border rounded-xl p-6 hover:border-emerald/40 transition-colors duration-200"
    >
      <p className={`text-sm font-medium ${accent.text} mb-1`}>{account.name}</p>
      <p className="text-sm text-muted mb-4">{account.tagline}</p>
      {apyMetric && (
        <p className="text-3xl font-[family-name:var(--font-geist-mono)] text-emerald mb-3">{apyMetric.value}</p>
      )}
      {deposited && (
        <p className="text-sm text-muted">Deposited: <span className="text-foreground">{deposited.value}</span></p>
      )}
      {earned && (
        <p className="text-sm text-muted mt-1">Earned: <span className="text-emerald">{earned.value}</span></p>
      )}
    </motion.div>
  );
}

function SmallCard({ accountId, highlight }: { accountId: string; highlight: string }) {
  const account = ACCOUNTS.find((a) => a.id === accountId)!;
  const accent = CARD_ACCENTS[accountId];
  const highlightMetric = account.metrics.find((m) =>
    m.label.toLowerCase().includes(highlight.toLowerCase())
  );
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: accent.shadow }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`bg-surface border border-border rounded-xl p-6 hover:${accent.border} transition-colors duration-200`}
    >
      <p className={`text-sm font-medium ${accent.text} mb-1`}>{account.name}</p>
      <p className="text-sm text-muted mb-4">{account.tagline}</p>
      {highlightMetric && (
        <p className={`text-3xl font-[family-name:var(--font-geist-mono)] ${accent.text}`}>{highlightMetric.value}</p>
      )}
    </motion.div>
  );
}

export default function Accounts() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.15em] font-sans font-medium text-muted mb-2">
            One SDK.
          </p>
          <h2 className="text-3xl lg:text-4xl font-[family-name:var(--font-instrument-serif)] text-foreground">
            Every financial primitive.
          </h2>
          <p className="text-muted mt-3 max-w-lg">
            Pay, earn, borrow, swap, invest — and more. All through a single TypeScript import.
          </p>
        </div>

        {/* Row 1: Core accounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CheckingCard />
          <SavingsCard />
          <SmallCard accountId="credit" highlight="health" />
          <SmallCard accountId="exchange" highlight="CC Price" />
          <SmallCard accountId="investment" highlight="P&L" />
        </div>

        {/* Row 2: Platform features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Safeguards */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 0 24px rgba(249,115,22,0.15)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-border rounded-xl p-6 hover:border-orange-500/40 transition-colors duration-200"
          >
            <p className="text-sm font-medium text-orange-400 mb-1">Safeguards</p>
            <p className="text-sm text-muted mb-4">Per-transaction limits. Daily spending caps. Emergency wallet lock.</p>
            <p className="text-3xl font-[family-name:var(--font-geist-mono)] text-orange-400 mb-3">$1,000 / tx</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-background rounded px-2 py-1 border border-border text-xs text-muted">Daily: $5,000</span>
              <span className="bg-background rounded px-2 py-1 border border-border text-xs text-muted">Status: Active</span>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 0 24px rgba(168,85,247,0.15)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-border rounded-xl p-6 hover:border-purple-500/40 transition-colors duration-200"
          >
            <p className="text-sm font-medium text-purple-400 mb-1">Privacy</p>
            <p className="text-sm text-muted mb-4">Sub-transaction privacy. Payment details visible only to sender and receiver.</p>
            <p className="text-3xl font-[family-name:var(--font-geist-mono)] text-purple-400 mb-3">2 parties</p>
            <p className="text-xs text-muted">Validators see nothing · Canton Network</p>
          </motion.div>

          {/* MCP */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 0 24px rgba(6,182,212,0.15)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-border rounded-xl p-6 hover:border-cyan-500/40 transition-colors duration-200"
          >
            <p className="text-sm font-medium text-cyan-400 mb-1">MCP</p>
            <p className="text-sm text-muted mb-4">35 tools. 20 prompts. Claude Desktop, Cursor, Windsurf.</p>
            <div className="font-[family-name:var(--font-geist-mono)] text-sm mb-3">
              <p className="text-muted">{'"What\'s my balance?"'}</p>
              <p className="text-cyan-400">→ $2,847.50 USDCx</p>
            </div>
          </motion.div>
        </div>

        {/* Row 3: Coming soon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-4xl mx-auto">
          {/* Session Payments */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 0 24px rgba(251,191,36,0.15)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-border rounded-xl p-6 hover:border-amber-400/40 transition-colors duration-200 relative"
          >
            <span className="absolute top-4 right-4 bg-amber-400/15 text-amber-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
            <p className="text-sm font-medium text-amber-400 mb-1">Session Payments</p>
            <p className="text-sm text-muted mb-4">Pay-per-token streaming. Micro-payments as LLM output flows.</p>
            <p className="text-2xl font-[family-name:var(--font-geist-mono)] text-amber-400 mb-3">347 tokens · $0.0041</p>
            <p className="text-xs text-muted">New MPP intent · Deterministic finality</p>
          </motion.div>

          {/* Agent-to-Agent */}
          <motion.div
            whileHover={{ y: -4, boxShadow: "0 0 24px rgba(251,113,133,0.15)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-surface border border-border rounded-xl p-6 hover:border-rose-400/40 transition-colors duration-200 relative"
          >
            <span className="absolute top-4 right-4 bg-rose-400/15 text-rose-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
            <p className="text-sm font-medium text-rose-400 mb-1">Agent-to-Agent</p>
            <p className="text-sm text-muted mb-4">Escrow. Conditional release. Multi-step settlement between agents.</p>
            <p className="text-2xl font-[family-name:var(--font-geist-mono)] text-rose-400 mb-3">{"A → Escrow → B"}</p>
            <p className="text-xs text-muted">Atomic settlement · Canton-native</p>
          </motion.div>
        </div>

        <p className="text-center mt-8 font-[family-name:var(--font-geist-mono)] text-xs text-muted">
          {"import { CantonAgent } from '@caypo/canton-sdk'"}
        </p>
      </div>
    </section>
  );
}
