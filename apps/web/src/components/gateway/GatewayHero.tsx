"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GATEWAY_TERMINAL_DEMOS, type GatewayTerminalDemo } from "@/lib/gateway-terminal-demos";

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const DEMO_DURATION = 12000;

// --- Phase-based terminal renderer ---

interface PhaseBlock {
  id: string;
  lines: Array<{ text: string; color: string; indent?: boolean }>;
  animation: "typed" | "instant" | "fade";
}

function buildPhases(demo: GatewayTerminalDemo): PhaseBlock[] {
  const json = JSON.stringify(demo.responseJson, null, 2);
  return [
    {
      id: "command",
      animation: "typed",
      lines: [{ text: `$ ${demo.command}`, color: "" }],
    },
    {
      id: "challenge",
      animation: "fade",
      lines: [
        { text: `\u2190 402 Payment Required`, color: "text-[#F59E0B]" },
        { text: `  method="canton" amount="${demo.challengeAmount}" currency="USDCx"`, color: "text-[#64748B]" },
      ],
    },
    {
      id: "payment",
      animation: "instant",
      lines: [
        { text: `\u2192 Paying ${demo.challengeAmount} USDCx from checking...`, color: "text-[#3B82F6]" },
      ],
    },
    {
      id: "payment-done",
      animation: "instant",
      lines: [
        { text: `  \u2713 Canton tx: ${demo.txId.slice(0, 16)}...${demo.txId.slice(-3)}`, color: "text-[#22C55E]" },
        { text: `  (${demo.paymentTiming})`, color: "text-[#64748B]" },
      ],
    },
    {
      id: "response",
      animation: "fade",
      lines: [
        { text: `\u2190 200 OK`, color: "text-[#22C55E]" },
      ],
    },
    {
      id: "json",
      animation: "fade",
      lines: json.split("\n").map((l) => ({ text: `  ${l}`, color: "text-[#94A3B8]" })),
    },
    {
      id: "receipt",
      animation: "fade",
      lines: [
        { text: `  Payment-Receipt: canton:receipt/${demo.txId.slice(0, 16)}...`, color: "text-[#60A5FA]" },
        { text: `  ${demo.receiptSummary}`, color: "text-[#64748B]" },
      ],
    },
  ];
}

function TerminalDemo({ demo, onDone }: { demo: GatewayTerminalDemo; onDone: () => void }) {
  const [visiblePhases, setVisiblePhases] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [spinnerIdx, setSpinnerIdx] = useState(-1);
  const cancelled = useRef(false);
  const phases = useRef(buildPhases(demo));

  const sleep = (ms: number) => new Promise<void>((r) => {
    const id = setTimeout(r, ms);
    // Can't truly cancel setTimeout, but we check cancelled flag after
    return () => clearTimeout(id);
  });

  useEffect(() => {
    cancelled.current = false;
    phases.current = buildPhases(demo);
    setVisiblePhases(0);
    setTypedText("");
    setSpinnerIdx(-1);

    async function run() {
      const p = phases.current;

      // Phase 0: typed command
      const cmdText = p[0].lines[0].text;
      for (let i = 0; i <= cmdText.length; i++) {
        if (cancelled.current) return;
        setTypedText(cmdText.slice(0, i));
        await sleep(25);
      }
      setVisiblePhases(1);
      await sleep(400);

      // Phase 1: 402 challenge
      if (cancelled.current) return;
      setVisiblePhases(2);
      await sleep(400);

      // Phase 2: payment start
      if (cancelled.current) return;
      setVisiblePhases(3);

      // Spinner
      for (let i = 0; i < 10; i++) {
        if (cancelled.current) return;
        setSpinnerIdx(i);
        await sleep(80);
      }
      setSpinnerIdx(-1);
      await sleep(150);

      // Phase 3: payment done
      if (cancelled.current) return;
      setVisiblePhases(4);
      await sleep(400);

      // Phase 4: 200 OK
      if (cancelled.current) return;
      setVisiblePhases(5);
      await sleep(300);

      // Phase 5: JSON
      if (cancelled.current) return;
      setVisiblePhases(6);
      await sleep(500);

      // Phase 6: receipt
      if (cancelled.current) return;
      setVisiblePhases(7);
      await sleep(500);

      onDone();
    }

    run();
    return () => { cancelled.current = true; };
  }, [demo, onDone]);

  const p = phases.current;

  // Color a command line with syntax highlighting
  function renderCommand(text: string) {
    return text.split("\n").map((line, i) => {
      // Highlight $ prompt, URLs, flags
      const parts: Array<{ text: string; color: string }> = [];
      if (line.startsWith("$ ")) {
        parts.push({ text: "$ ", color: "text-[#3B82F6]" });
        line = line.slice(2);
      }
      // Simple: URLs in light blue, flags in muted, rest white
      const urlMatch = line.match(/(https?:\/\/\S+)/);
      if (urlMatch) {
        const idx = line.indexOf(urlMatch[1]);
        if (idx > 0) parts.push({ text: line.slice(0, idx), color: "text-[#F8FAFC]" });
        parts.push({ text: urlMatch[1], color: "text-[#93C5FD]" });
        const rest = line.slice(idx + urlMatch[1].length);
        if (rest) parts.push({ text: rest, color: "text-[#94A3B8]" });
      } else if (line.includes("--") || line.includes("-X")) {
        parts.push({ text: line, color: "text-[#94A3B8]" });
      } else {
        parts.push({ text: line, color: "text-[#F8FAFC]" });
      }
      return (
        <div key={i}>
          {parts.map((p, j) => (
            <span key={j} className={p.color}>{p.text}</span>
          ))}
        </div>
      );
    });
  }

  return (
    <div className="font-[family-name:var(--font-geist-mono)] text-[13px] leading-[1.7] p-5 min-h-[320px]">
      {/* Phase 0: Command (typed) */}
      <div>{renderCommand(typedText)}</div>

      {/* Phase 1+: challenge */}
      {visiblePhases >= 2 && (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mt-3">
          {p[1].lines.map((l, i) => (
            <div key={i} className={l.color}>{l.text}</div>
          ))}
        </motion.div>
      )}

      {/* Phase 2: payment start */}
      {visiblePhases >= 3 && (
        <div className="mt-3">
          <div className="text-[#3B82F6]">
            {p[2].lines[0].text}
            {spinnerIdx >= 0 && <span className="ml-1 text-[#64748B]">{SPINNER[spinnerIdx]}</span>}
          </div>
        </div>
      )}

      {/* Phase 3: payment done */}
      {visiblePhases >= 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {p[3].lines.map((l, i) => (
            <div key={i} className={l.color}>{l.text}</div>
          ))}
        </motion.div>
      )}

      {/* Phase 4: 200 OK */}
      {visiblePhases >= 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-3">
          {p[4].lines.map((l, i) => (
            <div key={i} className={l.color}>{l.text}</div>
          ))}
        </motion.div>
      )}

      {/* Phase 5: JSON */}
      {visiblePhases >= 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {p[5].lines.map((l, i) => (
            <div key={i} className="text-[#94A3B8]">{l.text}</div>
          ))}
        </motion.div>
      )}

      {/* Phase 6: Receipt box */}
      {visiblePhases >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-3 border border-[rgba(59,130,246,0.15)] rounded-lg p-3"
        >
          {p[6].lines.map((l, i) => (
            <div key={i} className={l.color}>{l.text}</div>
          ))}
        </motion.div>
      )}

      {/* Cursor while animating */}
      {visiblePhases < 7 && (
        <span className="animate-blink text-[#3B82F6]">█</span>
      )}
    </div>
  );
}

// --- Main Hero ---

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function GatewayHero() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [key, setKey] = useState(0); // force remount
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);

  const scheduleNext = useCallback(() => {
    if (pausedRef.current) return;
    timerRef.current = setTimeout(() => {
      setActiveDemo((prev) => (prev + 1) % GATEWAY_TERMINAL_DEMOS.length);
      setKey((k) => k + 1);
    }, DEMO_DURATION);
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeDemo, scheduleNext]);

  const jumpTo = (idx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    pausedRef.current = true;
    setActiveDemo(idx);
    setKey((k) => k + 1);
    // Resume auto-advance after 30s
    setTimeout(() => { pausedRef.current = false; scheduleNext(); }, 30000);
  };

  const restart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setKey((k) => k + 1);
    scheduleNext();
  };

  const demo = GATEWAY_TERMINAL_DEMOS[activeDemo];

  return (
    <div className="min-h-screen px-6 py-24 max-w-7xl mx-auto flex items-center">
      <div className="lg:grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left side */}
        <div>
          <motion.p initial="hidden" animate="visible" variants={fadeUp}
            className="text-sm font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.15em] text-blue-400 mb-6"
          >
            CAYPO Gateway
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[48px] lg:text-[56px] tracking-[-0.03em] leading-[1.1]">
              Pay for any API
            </h1>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[48px] lg:text-[56px] tracking-[-0.03em] leading-[1.1] mb-6">
              with{" "}
              <span style={{ background: "linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                USDCx.
              </span>
            </h1>
          </motion.div>

          <div className="flex flex-col gap-1 mb-6">
            {["No API keys.", "No accounts.", "No signup."].map((line, i) => (
              <motion.p key={line} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }} className="text-muted text-lg"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.p initial="hidden" animate="visible" variants={fadeUp}
            className="font-[family-name:var(--font-geist-mono)] text-xs text-muted mt-6 mb-8"
          >
            17 services · 46 endpoints · Pay per request via Canton.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex gap-3 flex-wrap">
            <a href="/docs#quickstart" className="bg-blue-500 hover:bg-blue-400 text-background px-6 py-3 rounded-lg font-medium transition-all duration-200">
              Get Started
            </a>
            <a href="#services" className="border border-border hover:border-blue-500/30 text-muted hover:text-foreground px-6 py-3 rounded-lg transition-all duration-200">
              View Services
            </a>
          </motion.div>
        </div>

        {/* Right side — rotating terminal */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" as const }}
        >
          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20"
              style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)" }}
            />
            <div className="bg-[#0D0D14] border border-[#1E293B]/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.05)]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#0F0F18]">
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B] font-[family-name:var(--font-geist-mono)] text-sm font-medium">{">"}_</span>
                  <span className="text-[#94A3B8] font-[family-name:var(--font-geist-mono)] text-xs tracking-wide">CAYPO Gateway</span>
                </div>
                <button onClick={restart} className="text-[#64748B] hover:text-[#F8FAFC] transition-all duration-300 group" title="Restart">
                  <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 8a7 7 0 0 1 12.197-4.697M15 8a7 7 0 0 1-12.197 4.697" />
                    <path d="M14.5 2.5v4h-4M1.5 13.5v-4h4" />
                  </svg>
                </button>
              </div>

              {/* Terminal body */}
              <AnimatePresence mode="wait">
                <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <TerminalDemo demo={demo} onDone={() => {}} />
                </motion.div>
              </AnimatePresence>

              {/* Demo indicator */}
              <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4">
                {GATEWAY_TERMINAL_DEMOS.map((d, i) => (
                  <button key={d.id} onClick={() => jumpTo(i)} className="flex items-center gap-1.5 group">
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeDemo ? "bg-[#3B82F6]" : "bg-[#334155] group-hover:bg-[#64748B]"}`} />
                    <span className={`text-[11px] font-[family-name:var(--font-geist-mono)] transition-colors ${i === activeDemo ? "text-[#94A3B8]" : "text-[#475569] group-hover:text-[#64748B]"}`}>
                      {d.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted text-center mt-3">
            Works with Claude Code · Cursor · Any MCP client
          </p>
        </motion.div>
      </div>
    </div>
  );
}
