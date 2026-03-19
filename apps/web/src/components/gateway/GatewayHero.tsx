"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CMD_LINES = [
  { text: "$ caypo pay \\", type: "cmd" },
  { text: "    https://mpp.caypo.xyz/openai/v1/chat/completions \\", type: "cmd" },
  { text: "    -X POST --max-price 0.01", type: "cmd" },
  { text: "", type: "blank" },
  { text: "✓ 402 received — price: $0.003 USDCx", type: "output" },
  { text: "✓ Paid from checking (Canton tx: 0x7a2f...)", type: "output" },
  { text: '✓ Response: "Hello! How can I help you today?"', type: "output" },
];

function TerminalTyping() {
  const [displayedLines, setDisplayedLines] = useState<
    { text: string; type: string; done: boolean }[]
  >([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    if (currentLineIdx >= CMD_LINES.length) return;

    const line = CMD_LINES[currentLineIdx];

    if (line.type === "blank") {
      setDisplayedLines((prev) => [
        ...prev,
        { text: "", type: "blank", done: true },
      ]);
      setCurrentLineIdx((i) => i + 1);
      setCurrentCharIdx(0);
      return;
    }

    if (line.type === "output") {
      const delay = setTimeout(() => {
        setDisplayedLines((prev) => [
          ...prev,
          { text: line.text, type: line.type, done: true },
        ]);
        setCurrentLineIdx((i) => i + 1);
        setCurrentCharIdx(0);
      }, 150);
      return () => clearTimeout(delay);
    }

    // cmd: type char by char
    if (currentCharIdx <= line.text.length) {
      const timeout = setTimeout(() => {
        if (currentCharIdx === 0) {
          setDisplayedLines((prev) => [
            ...prev,
            { text: "", type: line.type, done: false },
          ]);
        } else {
          setDisplayedLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              text: line.text.slice(0, currentCharIdx),
              type: line.type,
              done: currentCharIdx === line.text.length,
            };
            return next;
          });
        }
        if (currentCharIdx === line.text.length) {
          setCurrentLineIdx((i) => i + 1);
          setCurrentCharIdx(0);
        } else {
          setCurrentCharIdx((c) => c + 1);
        }
      }, 25);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIdx, currentCharIdx]);

  const done = currentLineIdx >= CMD_LINES.length;

  return (
    <div className="font-[family-name:var(--font-geist-mono)] text-sm p-5 leading-relaxed">
      {displayedLines.map((line, i) => {
        if (line.type === "blank") return <div key={i} className="h-3" />;
        const isLast = i === displayedLines.length - 1;
        return (
          <div key={i} className="flex items-end">
            <span
              className={
                line.type === "output" ? "text-emerald-400" : "text-foreground"
              }
            >
              {line.text}
            </span>
            {isLast && !done && (
              <span
                className="inline-block w-[2px] h-[14px] bg-emerald-400 ml-0.5 mb-0.5"
                style={{ opacity: showCursor ? 1 : 0 }}
              />
            )}
          </div>
        );
      })}
      {done && (
        <div className="flex items-end">
          <span className="text-foreground">$ </span>
          <span
            className="inline-block w-[2px] h-[14px] bg-emerald-400 ml-0.5 mb-0.5"
            style={{ opacity: showCursor ? 1 : 0 }}
          />
        </div>
      )}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function GatewayHero() {
  return (
    <div className="min-h-screen px-6 py-24 max-w-7xl mx-auto flex items-center">
      <div className="lg:grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left side */}
        <div>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-sm font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.15em] text-emerald-500 mb-6"
          >
            CAYPO Gateway
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[48px] lg:text-[56px] tracking-[-0.03em] leading-[1.1]">
              Pay for any API
            </h1>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-[48px] lg:text-[56px] tracking-[-0.03em] leading-[1.1] mb-6">
              with{" "}
              <span
                style={{
                  background:
                    "linear-gradient(to right, #34d399, #6ee7b7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                USDCx.
              </span>
            </h1>
          </motion.div>

          <div className="flex flex-col gap-1 mb-6">
            {["No API keys.", "No accounts.", "No signup."].map((line, i) => (
              <motion.p
                key={line}
                custom={2 + i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="text-muted text-lg"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-[family-name:var(--font-geist-mono)] text-xs text-muted mt-6 mb-8"
          >
            17 services · 46 endpoints · Pay per request via Canton.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex gap-3 flex-wrap"
          >
            <a
              href="#services"
              className="bg-emerald-500 hover:bg-emerald-400 text-background px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Get Started
            </a>
            <a
              href="#services"
              className="border border-border hover:border-emerald-500/30 text-muted hover:text-foreground px-6 py-3 rounded-lg transition-all duration-200"
            >
              View Services
            </a>
          </motion.div>
        </div>

        {/* Right side — terminal */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" as const }}
        >
          <div className="bg-[#0D0D0D] border border-border rounded-xl overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-muted font-[family-name:var(--font-geist-mono)]">
                Terminal
              </span>
            </div>
            <TerminalTyping />
          </div>
          <p className="text-xs text-muted text-center mt-3">
            Works with Claude Code · Cursor · Any MCP client
          </p>
        </motion.div>
      </div>
    </div>
  );
}
