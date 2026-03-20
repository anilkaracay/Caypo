"use client";

import { useState } from "react";
import { SEARCH_INDEX, fuzzySearch, CATEGORY_LABELS, type SearchItem } from "@/lib/search-index";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const results = fuzzySearch(query, SEARCH_INDEX);

  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  function handleSelect(item: SearchItem) {
    document.querySelector(item.anchor)?.scrollIntoView({ behavior: "smooth" });
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 bg-[#12121A] border border-[#1E293B] rounded-xl shadow-2xl w-full max-w-[640px] mx-4 overflow-hidden">
        {/* Input area */}
        <div className="flex items-center px-4 py-3 border-b border-[#1E293B]">
          <svg
            className="w-5 h-5 text-[#94A3B8] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            className="flex-1 bg-transparent border-none outline-none text-lg text-[#F8FAFC] placeholder-[#64748B] ml-3"
            placeholder="Search docs..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
          <button
            className="text-xs text-[#64748B] bg-[#0A0A0F] px-2 py-0.5 rounded border border-[#1E293B]"
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {query === "" ? (
            <p className="text-sm text-[#64748B] p-4 text-center">
              Start typing to search packages, APIs, commands, and guides
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-[#64748B] p-4 text-center">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#64748B] px-3 py-1 mt-1">
                  {CATEGORY_LABELS[category]}
                </p>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1A1A24] flex items-start gap-3 group transition-colors"
                  >
                    <span className="text-[10px] bg-[#1E293B] text-[#64748B] px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <div>
                      <p className="text-sm text-[#F8FAFC] font-medium">{item.title}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#1E293B] flex gap-4 text-[10px] text-[#64748B]">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </>
  );
}
