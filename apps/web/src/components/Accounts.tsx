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
            Pay, earn, borrow, swap, invest — all through a single TypeScript import.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CheckingCard />
          <SavingsCard />
          <SmallCard accountId="credit" highlight="health" />
          <SmallCard accountId="exchange" highlight="CC Price" />
          <SmallCard accountId="investment" highlight="P&L" />
        </div>

        <p className="text-center mt-8 font-[family-name:var(--font-geist-mono)] text-xs text-muted">
          {"import { CantonAgent } from '@caypo/canton-sdk'"}
        </p>
      </div>
    </section>
  );
}
