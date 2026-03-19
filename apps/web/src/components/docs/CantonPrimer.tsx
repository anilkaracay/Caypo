import { CANTON_COMPARISON } from "@/lib/docs-data";

export default function CantonPrimer() {
  return (
    <div>
      <h2
        id="canton"
        className="font-[family-name:var(--font-instrument-serif)] text-2xl"
      >
        Canton Network for CAYPO developers
      </h2>
      <p className="text-muted text-sm mt-2">
        Canton is NOT an EVM chain. Key differences:
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-[13px] font-[family-name:var(--font-geist-mono)]">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-muted">
              <th className="border-b border-border py-2 text-left pr-8">
                EVM Concept
              </th>
              <th className="border-b border-border py-2 text-left">
                Canton Equivalent
              </th>
            </tr>
          </thead>
          <tbody>
            {CANTON_COMPARISON.map((row, index) => (
              <tr
                key={row.evm}
                className={`border-b border-border/30 ${
                  index % 2 === 0 ? "bg-surface/30" : ""
                }`}
              >
                <td className="py-2.5 pr-8 text-muted">{row.evm}</td>
                <td className="py-2.5 text-foreground">{row.canton}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border-l-[3px] border-l-blue-500 bg-blue-500/5 rounded-r-lg px-5 py-4">
        <p className="text-sm font-medium">Important:</p>
        <p className="text-sm text-muted mt-1">
          All amounts are STRINGS, not numbers. Never use floating-point arithmetic for USDCx. Canton uses Numeric 10 (10 decimal places).
        </p>
      </div>
    </div>
  );
}
