"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border backdrop-blur-xl"
          : "border-b border-transparent",
      ].join(" ")}
      style={{
        backgroundColor: scrolled ? "rgba(10,10,15,0.85)" : "transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="font-[family-name:var(--font-instrument-serif)] text-xl tracking-tight text-foreground select-none"
        >
          CAYPO
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Docs", href: "/docs" },
            {
              label: "GitHub",
              href: "https://github.com/anilkaracay/Caypo",
              external: true,
            },
            {
              label: "npm",
              href: "https://www.npmjs.com/org/caypo",
              external: true,
            },
          ].map(({ label, href, external }) => (
            <a
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="/docs/getting-started"
          className="text-sm font-medium px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-all duration-200"
          style={{
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 20px 4px rgba(59,130,246,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Launch Gateway &rarr;
        </a>
      </div>
    </header>
  );
}
