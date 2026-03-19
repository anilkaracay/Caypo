import { TICKER_ITEMS } from "@/lib/constants";

export default function AgentTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full border-t border-b border-border overflow-hidden py-3">
      <div className="flex animate-ticker whitespace-nowrap w-max">
        {items.map((item, i) => {
          const [address, ...rest] = item.split(" · ");
          const description = rest.join(" · ");
          return (
            <span
              key={i}
              className="inline-flex items-center gap-2 font-mono text-sm text-muted px-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald flex-shrink-0" />
              <span className="text-foreground">{address}</span>
              <span className="text-muted">·</span>
              <span>{description}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
