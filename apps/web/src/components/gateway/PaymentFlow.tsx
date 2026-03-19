const BOXES = [
  { title: "Agent", subtitle: "sends request", highlight: false },
  { title: "Gateway", subtitle: "returns 402", highlight: false },
  { title: "Canton", subtitle: "verifies payment", highlight: true },
  { title: "Agent", subtitle: "receives response", highlight: false },
];

const ARROW_LABELS = ["402", "USDCx", "200"];

export default function PaymentFlow() {
  return (
    <div>
      <h2 className="text-lg font-medium mb-8">How payment works</h2>

      <div className="flex items-center justify-between max-w-4xl mx-auto gap-2 flex-wrap">
        {BOXES.map((box, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`px-4 py-3 text-center min-w-[140px] rounded-lg border ${
                box.highlight
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "bg-surface border-border"
              }`}
            >
              <p className="text-sm font-medium">{box.title}</p>
              <p className="text-xs text-muted mt-1">{box.subtitle}</p>
            </div>
            {i < BOXES.length - 1 && (
              <div className="flex flex-col items-center mx-1">
                <span className="text-[10px] text-muted mb-0.5">
                  {ARROW_LABELS[i]}
                </span>
                <span className="text-muted text-lg">&rarr;</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center mt-6 text-xs text-muted font-[family-name:var(--font-geist-mono)]">
        Average payment latency: &lt;500ms. All payments are final. No
        chargebacks.
      </p>
    </div>
  );
}
