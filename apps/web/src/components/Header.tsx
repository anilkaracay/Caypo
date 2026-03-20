"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isGateway = pathname === "/gateway";

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

        {/* CTA — context-aware */}
        {isGateway ? (
          <a
            href="/"
            className="hidden md:inline-flex text-sm font-medium px-4 py-2 rounded-lg border border-border text-muted hover:text-foreground hover:border-border-hover transition-all duration-200"
          >
            &larr; caypo.xyz
          </a>
        ) : (
          <a
            href="/gateway"
            className="hidden md:inline-flex text-sm font-medium px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-all duration-200"
            style={{ boxShadow: "none" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px 4px rgba(59,130,246,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            Launch Gateway &rarr;
          </a>
        )}

        {/* Hamburger button (mobile) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden text-[#F8FAFC]"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8">
          {/* Close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-[#F8FAFC]"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Links */}
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl text-[#F8FAFC] hover:text-blue-400 transition-colors"
          >
            Home
          </a>
          <a
            href="/gateway"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl text-[#F8FAFC] hover:text-blue-400 transition-colors"
          >
            Gateway
          </a>
          <a
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl text-[#F8FAFC] hover:text-blue-400 transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/anilkaracay/Caypo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-[#F8FAFC] hover:text-blue-400 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/org/caypo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-[#F8FAFC] hover:text-blue-400 transition-colors"
          >
            npm
          </a>

          {/* CTA */}
          <a
            href="/gateway"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-medium px-6 py-3 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-all duration-200"
          >
            Launch Gateway &rarr;
          </a>
        </div>
      )}
    </header>
  );
}
