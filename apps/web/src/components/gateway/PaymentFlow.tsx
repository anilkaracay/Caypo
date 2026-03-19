const CARDS = [
  {
    step: "01",
    title: "Agent sends request",
    code: `GET /v1/chat/completions\nContent-Type: application/json`,
    highlight: false,
  },
  {
    step: "02",
    title: "Gateway returns 402",
    code: `HTTP 402 Payment Required\nWWW-Authenticate: Payment\n  method="canton" amount="0.003"`,
    highlight: false,
  },
  {
    step: "03",
    title: "Canton verifies payment",
    code: `TransferFactory.Transfer\n→ 0.003 USDCx → merchant`,
    highlight: true,
  },
  {
    step: "04",
    title: "Agent receives response",
    code: `HTTP 200 OK\nPayment-Receipt: canton:tx/0x7a..`,
    highlight: false,
  },
];

export default function PaymentFlow() {
  return (
    <div>
      <h2 className="text-lg font-medium mb-8">How payment works</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {CARDS.map((card) => (
          <div
            key={card.step}
            className={`rounded-xl p-5 border ${
              card.highlight
                ? "border-t-2 border-t-blue-500/50 bg-blue-500/[0.02] border-border"
                : "bg-surface border-border"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-[family-name:var(--font-geist-mono)] text-muted">
                {card.step}
              </span>
              <span className="text-sm font-medium">{card.title}</span>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-3 font-[family-name:var(--font-geist-mono)] text-xs text-muted whitespace-pre">
              {card.code}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center mt-8 text-sm text-muted font-[family-name:var(--font-geist-mono)]">
        Average payment latency: &lt;500ms. All payments are final. No
        chargebacks.
      </p>
    </div>
  );
}
