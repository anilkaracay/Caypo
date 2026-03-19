"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEMO_TABS } from "@/lib/gateway-demos";

export default function AgentDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const userInteracted = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Blinking cursor
  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!userInteracted.current) {
        setActiveIdx((i) => (i + 1) % DEMO_TABS.length);
        setProgressKey((k) => k + 1);
      }
    }, 8000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleTabClick(idx: number) {
    setActiveIdx(idx);
    setProgressKey((k) => k + 1);
    userInteracted.current = true;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      userInteracted.current = false;
    }, 30000);
  }

  const tab = DEMO_TABS[activeIdx];

  return (
    <div>
      {/* Header */}
      <p className="text-xs font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.15em] text-emerald-500 mb-3">
        See it in action
      </p>
      <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl lg:text-4xl mb-2">
        Your agent uses services.
      </h2>
      <p className="text-muted text-lg mb-8">CAYPO handles the payments.</p>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-0 relative">
        {DEMO_TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => handleTabClick(i)}
            className={`relative px-5 py-3 text-sm cursor-pointer transition-colors duration-150 ${
              i === activeIdx
                ? "text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
            {i === activeIdx && (
              <motion.div
                layoutId="demo-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500"
                transition={{ duration: 0.25, ease: "easeOut" as const }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <ProgressBar key={progressKey} />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" as const }}
        >
          <div className="bg-surface border border-border rounded-xl p-6 mt-0">
            {/* Prompt */}
            <p className="text-foreground font-medium italic border-l-2 border-emerald-500/50 pl-4">
              &ldquo;{tab.prompt}&rdquo;
            </p>

            {/* Agent called line */}
            <div className="flex items-center gap-2 mt-4 mb-4 flex-wrap">
              <span className="text-xs text-muted">Agent called</span>
              {tab.services.map((s) => (
                <span
                  key={s.name}
                  className="bg-surface-hover px-2 py-0.5 rounded text-xs font-[family-name:var(--font-geist-mono)]"
                >
                  {s.name}
                </span>
              ))}
              <span className="text-emerald-400 font-[family-name:var(--font-geist-mono)] text-sm ml-auto">
                {tab.services.map((s) => s.cost).join(" + ")}
              </span>
            </div>

            {/* Steps */}
            {tab.steps.map((step, si) => (
              <div key={si} className="mb-4">
                <p className="text-sm text-muted mb-2">{step.title}</p>
                <div className="bg-[#0a0a0a] rounded-lg p-3">
                  {step.items.map((item, ii) => (
                    <div
                      key={ii}
                      className={`flex justify-between items-center py-2 ${
                        ii < step.items.length - 1
                          ? "border-b border-border/30"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground">
                          {item.label}
                        </span>
                        <span className="text-xs text-muted">{item.detail}</span>
                      </div>
                      {item.source && (
                        <span className="text-xs text-emerald-400">
                          {item.source}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Total cost */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">
                Total cost ({tab.services.length} API calls)
              </span>
              <span className="text-emerald-400 font-[family-name:var(--font-geist-mono)] font-medium">
                {tab.totalCost}
              </span>
            </div>

            {/* Follow-up */}
            <p className="mt-4 text-sm text-muted">
              {tab.followUp}
              <span
                className="inline-block w-[2px] h-[13px] bg-muted ml-0.5 align-middle"
                style={{ opacity: showCursor ? 1 : 0 }}
              />
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProgressBar({ key: _key }: { key?: number }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-[2px] bg-border w-full mb-0">
      <div
        className="h-full bg-emerald-500"
        style={{
          width: started ? "100%" : "0%",
          transition: started ? "width 8s linear" : "none",
        }}
      />
    </div>
  );
}
