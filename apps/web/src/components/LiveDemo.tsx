"use client";

import { useState } from "react";
import ScenarioSelector from "@/components/ScenarioSelector";
import LiveTerminal from "@/components/LiveTerminal";

export default function LiveDemo() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleRestart = () => setSelectedScenario(null);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#0D0D14] border border-[#1E293B]/50 rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(30,41,59,0.3)]">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B] font-[family-name:var(--font-geist-mono)] text-sm">{">_"}</span>
            <span className="text-[#94A3B8] font-[family-name:var(--font-geist-mono)] text-xs tracking-wide">CAYPO Live Demo</span>
          </div>

          <div className="flex items-center gap-3">
            {selectedScenario !== null && (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[#64748B] font-[family-name:var(--font-geist-mono)] text-[11px]">Canton DevNet</span>
              </div>
            )}

            {selectedScenario !== null && (
              <button
                onClick={handleRestart}
                className="text-[#64748B] hover:text-[#F8FAFC] transition-all duration-200 flex items-center gap-1.5 text-xs font-[family-name:var(--font-geist-mono)] group"
                title="Restart demo"
              >
                <svg
                  className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 8a6 6 0 0 1 10.472-3.976M14 8a6 6 0 0 1-10.472 3.976" />
                  <path d="M14 3v4h-4M2 13V9h4" />
                </svg>
                Restart
              </button>
            )}
          </div>
        </div>

        {selectedScenario === null ? (
          <ScenarioSelector onSelect={(id) => setSelectedScenario(id)} />
        ) : (
          <LiveTerminal
            scenarioId={selectedScenario}
            onReset={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
