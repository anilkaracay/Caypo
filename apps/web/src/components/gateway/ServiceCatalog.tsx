"use client";

import { useState } from "react";
import { GATEWAY_SERVICES, CATEGORIES } from "@/lib/gateway-services";

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
      className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer mt-2 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function ServiceCatalog() {
  const categoryKeys = Object.keys(CATEGORIES) as Array<
    keyof typeof CATEGORIES
  >;

  return (
    <div>
      {/* Header */}
      <p className="font-[family-name:var(--font-geist-mono)] text-sm text-muted mb-8">
        17 services · 46 endpoints · from $0.0005/request
      </p>

      {/* Categories */}
      {categoryKeys.map((catKey) => {
        const cat = CATEGORIES[catKey];
        const services = GATEWAY_SERVICES.filter((s) => s.category === catKey);
        return (
          <div key={catKey} className="mb-8">
            {/* Category label */}
            <div className="flex items-center mb-3">
              <span className="text-xs uppercase tracking-[0.15em] text-muted font-medium">
                {cat.label}
              </span>
              <div className="flex-1 h-px bg-border ml-3" />
            </div>

            {/* Services grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group relative bg-surface border border-border rounded-lg p-4 hover:border-emerald-500/30 transition-all duration-200 cursor-default"
                >
                  <p className="text-sm font-medium text-foreground">
                    {service.name}
                  </p>
                  <p className="text-xs text-muted mt-1 truncate">
                    {service.description}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs text-muted">
                      {service.endpoints} endpoints
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs text-emerald-400">
                      {service.priceRange}
                    </span>
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg p-3 z-10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <p className="font-[family-name:var(--font-geist-mono)] text-xs text-muted break-all">
                      {service.baseUrl}
                    </p>
                    {service.models && service.models.length > 0 && (
                      <p className="text-xs text-muted mt-1">
                        {service.models.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Discovery cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-muted">
            For agents
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-sm text-foreground mt-2">
            GET mpp.caypo.xyz/llms.txt
          </p>
          <p className="text-xs text-muted mt-1">
            Service discovery for AI agents.
          </p>
          <CopyButton text="GET mpp.caypo.xyz/llms.txt" />
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-muted">
            For developers
          </p>
          <p className="font-[family-name:var(--font-geist-mono)] text-sm text-foreground mt-2">
            GET mpp.caypo.xyz/api/services
          </p>
          <p className="text-xs text-muted mt-1">
            JSON catalog with full pricing.
          </p>
          <CopyButton text="GET mpp.caypo.xyz/api/services" />
        </div>
      </div>
    </div>
  );
}
