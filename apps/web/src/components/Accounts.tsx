"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCOUNTS } from "@/lib/constants";

export default function Accounts() {
  const [activeId, setActiveId] = useState(ACCOUNTS[0].id);
  const active = ACCOUNTS.find((a) => a.id === activeId) ?? ACCOUNTS[0];

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="text-sm text-accent font-mono mb-3">Accounts</p>
          <h2 className="font-display text-4xl lg:text-5xl text-foreground tracking-tight">
            Five accounts. One agent.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
          {ACCOUNTS.map((account) => {
            const isActive = account.id === activeId;
            return (
              <button
                key={account.id}
                onClick={() => setActiveId(account.id)}
                className={[
                  "relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                  "focus:outline-none",
                  isActive ? "text-foreground" : "text-muted hover:text-foreground",
                ].join(" ")}
              >
                {account.name}
                {isActive && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="rounded-xl border border-border bg-surface p-6 md:p-8"
          >
            {/* Tagline */}
            <p className="text-muted text-sm mb-6">{active.tagline}</p>

            {/* CLI block */}
            <div className="rounded-lg border border-border bg-background p-4 mb-6 overflow-x-auto">
              <pre className="font-mono text-sm text-foreground whitespace-pre leading-relaxed">
                {active.cli}
              </pre>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-4">
              {active.metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col gap-1">
                  <span className="text-xs text-muted">{metric.label}</span>
                  <span className="text-sm font-mono text-foreground font-medium">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
