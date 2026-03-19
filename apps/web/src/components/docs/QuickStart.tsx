"use client";

import { useState } from "react";
import { QUICKSTART_TABS } from "@/lib/docs-data";

function CodeBlock({ tab }: { tab: (typeof QUICKSTART_TABS)[number] }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(tab.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderShellLine(line: string, i: number) {
    if (line.startsWith("$")) {
      return (
        <span key={i} className="block">
          <span className="text-muted">$</span>
          <span className="text-foreground">{line.slice(1)}</span>
        </span>
      );
    }
    if (line.startsWith("✓")) {
      return (
        <span key={i} className="block text-blue-400">{line}</span>
      );
    }
    if (line.startsWith("#")) {
      return (
        <span key={i} className="block text-muted">{line}</span>
      );
    }
    return <span key={i} className="block text-foreground">{line}</span>;
  }

  return (
    <div className="bg-[#0D0D14] border border-border/50 rounded-xl p-5 font-[family-name:var(--font-geist-mono)] text-[13px] leading-[1.7] overflow-x-auto relative">
      <button
        onClick={handleCopy}
        className={`absolute top-4 right-4 text-xs cursor-pointer ${copied ? "text-blue-400" : "text-muted hover:text-blue-400"}`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {tab.language === "shell" ? (
        <pre className="whitespace-pre">
          {tab.code.split("\n").map((line, i) => renderShellLine(line, i))}
        </pre>
      ) : (
        <pre className="whitespace-pre text-foreground">{tab.code}</pre>
      )}
    </div>
  );
}

export default function QuickStart() {
  const [activeTab, setActiveTab] = useState("install");

  const currentTab = QUICKSTART_TABS.find((t) => t.id === activeTab) ?? QUICKSTART_TABS[0];

  return (
    <div>
      <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl mb-6">
        Quick Start
      </h2>

      <div className="flex gap-1 border-b border-border">
        {QUICKSTART_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm transition-colors relative ${
                isActive
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              style={
                isActive
                  ? {
                      borderBottom: "2px solid #3B82F6",
                      marginBottom: "-1px",
                    }
                  : { borderBottom: "2px solid transparent", marginBottom: "-1px" }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="text-sm text-muted mb-4">{currentTab.description}</p>
        <CodeBlock tab={currentTab} />
      </div>
    </div>
  );
}
