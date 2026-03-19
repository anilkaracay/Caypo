import { GATEWAY_SERVICES } from "@/lib/gateway-services";

export default function Pricing() {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl">
        Transparent pricing
      </h2>
      <p className="text-muted text-sm mt-2 max-w-xl">
        Every request priced in USD, paid in USDCx. No markup — pass-through
        costs + 0.1% protocol fee.
      </p>

      <table className="mt-8 w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">
              Service
            </th>
            <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">
              Price Range
            </th>
            <th className="py-3 text-left text-xs uppercase tracking-wide text-muted font-medium">
              Example
            </th>
          </tr>
        </thead>
        <tbody>
          {GATEWAY_SERVICES.map((service, i) => (
            <tr
              key={service.id}
              className={`border-b border-border/50 hover:bg-surface-hover/50 transition-colors ${
                i % 2 === 0 ? "bg-surface/30" : ""
              }`}
            >
              <td className="py-3 text-sm text-foreground">{service.name}</td>
              <td className="py-3 text-sm font-[family-name:var(--font-geist-mono)] text-emerald-400">
                {service.priceRange}
              </td>
              <td className="py-3 text-sm text-muted">{service.example}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-6 text-xs text-muted">
        Protocol fee: 0.1% per transaction (contributed as CC traffic). All
        prices in USD, settled in USDCx on Canton Network.
      </p>
    </div>
  );
}
