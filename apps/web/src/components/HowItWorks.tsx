import { FLOW_STEPS } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="text-sm text-accent font-mono mb-3">How it works</p>
          <h2 className="font-display text-4xl lg:text-5xl text-foreground tracking-tight">
            How agents pay with CAYPO
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-border" aria-hidden />

          <ol className="flex flex-col gap-0">
            {FLOW_STEPS.map((step, index) => {
              const isHighlighted = step.num === "03";
              return (
                <li key={step.num} className="relative flex gap-6 pb-10 last:pb-0">
                  {/* Number circle */}
                  <div
                    className={[
                      "relative z-10 flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center",
                      "font-mono text-xs font-medium",
                      isHighlighted
                        ? "border-accent bg-accent text-white"
                        : "border-accent text-accent bg-background",
                    ].join(" ")}
                  >
                    {step.num}
                  </div>

                  {/* Content */}
                  <div
                    className={[
                      "flex-1 rounded-xl p-5 border",
                      isHighlighted
                        ? "border-accent bg-accent/10"
                        : "border-border bg-surface",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "font-medium text-sm mb-2",
                        isHighlighted ? "text-accent" : "text-foreground",
                      ].join(" ")}
                    >
                      {step.title}
                    </p>
                    <code className="font-mono text-xs text-muted break-all">
                      {step.code}
                    </code>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
