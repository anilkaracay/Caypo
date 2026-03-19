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
      className="text-xs text-muted hover:text-emerald-400 transition-colors cursor-pointer"
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
        {CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-xl overflow-hidden"
          >
            {/* Card header */}
            <div className="px-5 py-3 border-b border-border flex justify-between items-center">
              <span className="font-[family-name:var(--font-geist-mono)] text-sm font-medium">
                {card.label}
              </span>
              <CopyButton text={card.code} />
            </div>

            {/* Code block */}
            <pre className="bg-[#0a0a0a] p-5 font-[family-name:var(--font-geist-mono)] text-sm text-emerald-400 whitespace-pre overflow-x-auto">
              {card.code}
            </pre>

            {/* Best for */}
            <div className="px-5 py-3 text-xs text-muted">
              <span className="text-muted/60">Best for: </span>
              {card.bestFor}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
