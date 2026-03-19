"use client";

import { useState } from "react";

const CARDS = [
  {
    label: "CLI",
    bestFor: "quick testing, scripts",
    code: `$ npm i -g @caypo/canton-cli
$ caypo init
$ caypo pay \\
    https://mpp.caypo.xyz/\\
    openai/v1/chat/completions`,
  },
  {
    label: "SDK",
    bestFor: "apps, bots, workflows",
    code: `import { MppPayClient }
  from '@caypo/canton-sdk'

const result = await
  agent.mpp.pay(url, {
    method: 'POST',
    body: JSON.stringify(data),
    maxPrice: '0.05'
  })`,
  },
  {
    label: "MCP",
    bestFor: "Claude Desktop, Cursor, Windsurf",
    code: `// claude_desktop_config.json
{
  "mcpServers": {
    "caypo": {
      "command": "npx",
      "args": ["@caypo/canton-mcp"]
    }
  }
}`,
    recommended: true,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className={`text-xs transition-colors cursor-pointer ${
        copied ? "text-blue-400" : "text-muted hover:text-blue-400"
      }`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Quickstart() {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl mb-8">
        Get started in 60 seconds
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const isMcp = card.recommended;
          return (
            <div
              key={card.label}
              className={`bg-surface border rounded-xl overflow-hidden ${
                isMcp
                  ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.06)]"
                  : "border-border"
              }`}
            >
              {/* Card header */}
              <div className="px-5 py-3 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-geist-mono)] text-sm font-medium">
                    {card.label}
                  </span>
                  {isMcp && (
                    <span className="text-[10px] uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                </div>
                <CopyButton text={card.code} />
              </div>

              {/* Code block */}
              <pre className="bg-[#0a0a0a] p-5 font-[family-name:var(--font-geist-mono)] text-sm text-blue-400 whitespace-pre overflow-x-auto">
                {card.code}
              </pre>

              {/* Best for */}
              <div className="px-5 py-3 text-xs text-muted">
                <span className="text-muted/60 font-medium">Best for: </span>
                {card.bestFor}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
