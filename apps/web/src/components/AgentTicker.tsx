import { TICKER_ITEMS } from "@/lib/constants";

export default function AgentTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className="w-full border-y border-border py-3 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 5%, black 95%, transparent)",
      }}
    >
      <div className="flex whitespace-nowrap animate-ticker">
        {items.map((item, i) => {
          const [address, ...rest] = item.split(" \u00B7 ");
          const description = rest.join(" \u00B7 ");
          return (
            <span
              key={i}
              className="inline-flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-sm text-muted px-6"
            >
              <span className="text-border select-none">|</span>
              <span className="text-foreground">{address}</span>
              <span className="text-muted">&middot;</span>
              <span>{description}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
