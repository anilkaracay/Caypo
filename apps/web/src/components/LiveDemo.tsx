"use client";

import { useState } from "react";
import ScenarioSelector from "@/components/ScenarioSelector";
import LiveTerminal from "@/components/LiveTerminal";

export default function LiveDemo() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#0D0D14] border border-[#1E293B]/50 rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E293B]/30">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
          <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <span className="text-xs text-[#64748B] ml-2">CAYPO Live Demo</span>
          <span className="text-xs text-[#64748B] ml-auto">Canton DevNet</span>
        </div>

        {selectedScenario === null ? (
          <ScenarioSelector onSelect={(id) => setSelectedScenario(id)} />
        ) : (
          <LiveTerminal
            scenarioId={selectedScenario}
            onReset={() => setSelectedScenario(null)}
          />
        )}
      </div>
    </div>
  );
}
