"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "backdrop-blur-md bg-background/80",
        scrolled ? "border-b border-border" : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="font-display text-xl tracking-wide text-foreground select-none">
          CAYPO
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Docs", href: "/docs" },
            { label: "GitHub", href: "https://github.com/cayvox-labs/caypo", target: "_blank" },
            { label: "npm", href: "https://www.npmjs.com/org/caypo", target: "_blank" },
          ].map(({ label, href, target }) => (
            <a
              key={label}
              href={href}
              target={target}
              rel={target ? "noopener noreferrer" : undefined}
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <motion.a
          href="/docs/getting-started"
          whileHover={{ boxShadow: "0 0 16px 2px var(--accent-glow)" }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors duration-200"
        >
          Launch Gateway →
        </motion.a>
      </div>
    </header>
  );
}
