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
      // easeOut
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return count;
}

function StatCell({
  value,
  label,
  isLast,
}: {
  value: string;
  label: string;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const numericTarget = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const count = useCountUp(numericTarget, 1500, isInView);

  return (
    <div
      ref={ref}
      className={[
        "py-10 px-6 text-center",
        isLast ? "" : "border-r border-border",
      ].join(" ")}
    >
      <span
        className="text-4xl lg:text-5xl font-[family-name:var(--font-instrument-serif)] tracking-tight text-foreground block"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {isInView ? count : 0}
      </span>
      <span className="text-sm text-muted mt-2 block">{label}</span>
    </div>
  );
}

export default function Numbers() {
  return (
    <section className="border-y border-border">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {STATS.map((stat, i) => (
          <StatCell
            key={stat.label}
            value={stat.value}
            label={stat.label}
            isLast={i === STATS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
