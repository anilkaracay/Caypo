"use client";

import { useState, useEffect } from "react";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";

interface Props {
  onSelect: (id: string) => void;
}

export default function ScenarioSelector({ onSelect }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + DEMO_SCENARIOS.length) % DEMO_SCENARIOS.length);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % DEMO_SCENARIOS.length);
      } else if (e.key === "Enter") {
        onSelect(DEMO_SCENARIOS[activeIndex].id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onSelect]);

  return (
    <div className="p-5">
      <p className="text-sm text-[#94A3B8] mb-4">Select a scenario:</p>
      <div className="space-y-1">
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            onMouseEnter={() => setActiveIndex(i)}
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
              i === activeIndex ? "bg-blue-500/10 text-[#F8FAFC]" : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            <span className="font-[family-name:var(--font-geist-mono)] text-xs mt-0.5 shrink-0">
              {i === activeIndex ? "▸" : " "}
            </span>
            <div>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{s.tagline}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-[#64748B] mt-4 font-[family-name:var(--font-geist-mono)]">
        ↑↓ Navigate &nbsp; ↵ Select
      </p>
    </div>
  );
}
