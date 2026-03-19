"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { STATS } from "@/lib/constants";

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (target === 0) return;

    let start: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return count;
}

function StatCard({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const numericTarget = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const count = useCountUp(numericTarget, 1400, isInView);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 py-6 px-4">
      <span className="font-mono text-3xl font-medium text-foreground">
        {isInView ? count : 0}
      </span>
      <span className="text-sm text-muted text-center leading-snug">{label}</span>
    </div>
  );
}

export default function Numbers() {
  return (
    <section className="py-24 px-6 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-sm text-accent font-mono mb-3">By the numbers</p>
          <h2 className="font-display text-4xl lg:text-5xl text-foreground tracking-tight">
            Built to ship
          </h2>
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-border rounded-xl overflow-hidden">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-background">
              <StatCard value={stat.value} label={stat.label} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
