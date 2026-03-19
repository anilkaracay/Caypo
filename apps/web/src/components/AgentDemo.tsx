"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { TERMINAL_LINES } from "@/lib/constants";

type Line = (typeof TERMINAL_LINES)[number];

interface RenderedLine {
  line: Line;
  displayText: string;
  done: boolean;
}

const CMD_CHAR_DELAY = 30; // ms per character for cmd lines
const OUT_APPEAR_DELAY = 200; // ms before an out/gap line appears

export default function AgentDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [rendered, setRendered] = useState<RenderedLine[]>([]);
  const [playing, setPlaying] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const play = () => {
    clearTimeouts();
    setRendered([]);
    setPlaying(true);

    let cursor = 0; // cumulative ms

    TERMINAL_LINES.forEach((line, lineIndex) => {
      if (line.type === "gap") {
        // Gap line: just add a blank entry after a small pause
        cursor += 80;
        const t = setTimeout(() => {
          setRendered((prev) => [
            ...prev,
            { line, displayText: "", done: true },
          ]);
        }, cursor);
        timeoutsRef.current.push(t);
        return;
      }

      if (line.type === "out") {
        cursor += OUT_APPEAR_DELAY;
        const t = setTimeout(() => {
          setRendered((prev) => [
            ...prev,
            { line, displayText: line.text, done: true },
          ]);
        }, cursor);
        timeoutsRef.current.push(t);
        return;
      }

      // cmd: type char by char
      cursor += 120; // brief pause before each cmd
      const chars = line.text.split("");
      chars.forEach((_, charIdx) => {
        const charCursor = cursor + charIdx * CMD_CHAR_DELAY;
        const isFirst = charIdx === 0;
        const t = setTimeout(() => {
          const partial = line.text.slice(0, charIdx + 1);
          setRendered((prev) => {
            if (isFirst) {
              return [...prev, { line, displayText: partial, done: false }];
            }
            const next = [...prev];
            next[next.length - 1] = {
              line,
              displayText: partial,
              done: charIdx === chars.length - 1,
            };
            return next;
          });
        }, charCursor);
        timeoutsRef.current.push(t);
      });
      cursor += chars.length * CMD_CHAR_DELAY;
    });

    // Mark playing done
    const done = setTimeout(() => setPlaying(false), cursor + 100);
    timeoutsRef.current.push(done);
  };

  // Auto-play when scrolled into view
  useEffect(() => {
    if (isInView) play();
    return clearTimeouts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  const handleRestart = () => play();

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="text-sm text-accent font-mono mb-3">Live demo</p>
          <h2 className="font-display text-4xl lg:text-5xl text-foreground tracking-tight">
            See it in action
          </h2>
        </div>

        {/* Terminal window */}
        <div
          ref={ref}
          className="rounded-xl border border-border bg-[#0D0D0D] overflow-hidden shadow-2xl"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
              <span className="ml-3 text-xs text-muted font-mono">Terminal</span>
            </div>
            <button
              onClick={handleRestart}
              className="text-xs text-muted hover:text-foreground transition-colors duration-200 font-mono"
            >
              Restart
            </button>
          </div>

          {/* Body */}
          <div className="p-5 min-h-[340px] font-mono text-sm leading-relaxed">
            {rendered.map((r, i) => {
              if (r.line.type === "gap") {
                return <div key={i} className="h-4" />;
              }
              const isCurrentCmd =
                r.line.type === "cmd" && !r.done && i === rendered.length - 1;
              return (
                <div key={i} className="flex items-start">
                  <span
                    className={
                      r.line.type === "cmd" ? "text-foreground" : "text-emerald"
                    }
                  >
                    {r.displayText}
                  </span>
                  {isCurrentCmd && (
                    <span className="ml-0.5 animate-blink text-foreground">▌</span>
                  )}
                </div>
              );
            })}
            {/* Idle cursor at the very end */}
            {!playing && rendered.length > 0 && (
              <div className="flex items-center mt-1">
                <span className="text-muted">$ </span>
                <span className="ml-0.5 animate-blink text-foreground">▌</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
