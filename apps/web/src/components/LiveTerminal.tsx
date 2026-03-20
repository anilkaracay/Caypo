"use client";

import { useState, useEffect, useRef } from "react";
import type { DemoLine } from "@/lib/demo-fallback";

interface Props {
  scenarioId: string;
  onReset: () => void;
}

export default function LiveTerminal({ scenarioId, onReset }: Props) {
  const [lines, setLines] = useState<DemoLine[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLines([]);
    setRunning(true);
    setDone(false);

    let cancelled = false;

    async function run() {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioId }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone || cancelled) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const event of events) {
          const dataLine = event.replace("data: ", "").trim();
          if (!dataLine) continue;
          const parsed = JSON.parse(dataLine);
          if (parsed.type === "done") {
            setDone(true);
            setRunning(false);
            break;
          }
          setLines(prev => [...prev, parsed]);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  function renderLine(line: DemoLine, index: number) {
    if (line.type === "gap") {
      return <div key={index} className="h-2" />;
    }

    if (line.type === "header") {
      return (
        <div key={index} className="text-[#64748B] font-semibold mt-2">
          {line.text}
        </div>
      );
    }

    if (line.type === "box") {
      return (
        <div key={index} className="border border-[#1E293B]/50 rounded-lg p-3 my-2">
          {line.title && (
            <p className="text-[#64748B] text-xs font-semibold mb-2">{line.title}</p>
          )}
          {line.lines?.map((l, i) => (
            <p key={i} className="text-[#94A3B8]">{l}</p>
          ))}
        </div>
      );
    }

    if (line.type === "stats") {
      return (
        <div key={index} className="text-[#64748B] text-[11px]">
          {line.stats?.txCount} Canton transactions · {line.stats?.trafficCC} CC traffic · {line.stats?.totalMs}ms total
        </div>
      );
    }

    if (line.type === "line") {
      const styleMap: Record<string, string> = {
        success: "text-[#22C55E]",
        command: "text-[#F8FAFC]",
        info: "text-[#94A3B8]",
        accent: "text-[#3B82F6]",
        muted: "text-[#64748B]",
        warn: "text-[#EAB308]",
        link: "text-[#60A5FA] underline cursor-pointer",
      };

      const className = line.style ? (styleMap[line.style] ?? "text-[#94A3B8]") : "text-[#94A3B8]";

      const content = (
        <>
          {line.text}
          {line.timing && (
            <span className="text-[#64748B] text-[11px] ml-2">({line.timing})</span>
          )}
        </>
      );

      if (line.style === "link" && line.url) {
        return (
          <div key={index} className={className}>
            <a href={line.url} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          </div>
        );
      }

      return (
        <div key={index} className={className}>
          {content}
        </div>
      );
    }

    return null;
  }

  return (
    <div className="bg-[#0D0D14] border border-[#1E293B]/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E293B]/30">
        <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
        <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
        <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
        <span className="text-xs text-[#64748B] ml-2">CAYPO Live Demo</span>
        <span className="text-xs text-[#64748B] ml-auto">Canton DevNet</span>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="p-5 font-[family-name:var(--font-geist-mono)] text-[13px] leading-[1.7] max-h-[500px] overflow-y-auto"
      >
        {lines.map((line, i) => renderLine(line, i))}

        {running && (
          <span className="animate-pulse text-[#3B82F6]">█</span>
        )}

        {done && (
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={onReset}
              className="text-xs text-[#3B82F6] hover:underline"
            >
              ▸ Try another demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
