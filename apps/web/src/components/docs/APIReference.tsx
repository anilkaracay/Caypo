import { CLI_COMMANDS, MCP_TOOLS_TOP } from "@/lib/docs-data";

type TreeLine = {
  prefix: string;
  method: string;
  arrow: string;
  returnType: string;
};

function ApiTree({ lines }: { lines: TreeLine[] }) {
  return (
    <div className="font-[family-name:var(--font-geist-mono)] text-[13px] bg-[#0D0D14] border border-border/50 rounded-xl p-5 leading-[1.8]">
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="text-border select-none">{line.prefix}</span>
          <span className="text-foreground">{line.method}</span>
          <span className="text-muted italic">{line.arrow}{line.returnType}</span>
        </div>
      ))}
    </div>
  );
}

const cantonClientLines: TreeLine[] = [
  { prefix: "CantonClient\n", method: "", arrow: "", returnType: "" },
  { prefix: "├── ", method: ".submitAndWait(params)", arrow: "         → ", returnType: "SubmitAndWaitResponse" },
  { prefix: "├── ", method: ".queryActiveContracts(params)", arrow: "  → ", returnType: "ActiveContract[]" },
  { prefix: "├── ", method: ".getTransactionById(id)", arrow: "        → ", returnType: "TransactionTree | null" },
  { prefix: "├── ", method: ".getLedgerEnd()", arrow: "                → ", returnType: "number" },
  { prefix: "├── ", method: ".allocateParty(hint)", arrow: "           → ", returnType: "PartyDetails" },
  { prefix: "└── ", method: ".isHealthy()", arrow: "                   → ", returnType: "boolean" },
];

const usdcxLines: TreeLine[] = [
  { prefix: "USDCxService\n", method: "", arrow: "", returnType: "" },
  { prefix: "├── ", method: ".transfer(to, amount)", arrow: "          → ", returnType: "UpdateId" },
  { prefix: "├── ", method: ".getBalance(partyId)", arrow: "           → ", returnType: "string" },
  { prefix: "└── ", method: ".getHoldings(partyId)", arrow: "          → ", returnType: "Holding[]" },
];

const safeguardLines: TreeLine[] = [
  { prefix: "SafeguardManager\n", method: "", arrow: "", returnType: "" },
  { prefix: "├── ", method: ".get(partyId)", arrow: "                  → ", returnType: "SafeguardConfig" },
  { prefix: "├── ", method: ".set(partyId, config)", arrow: "          → ", returnType: "void" },
  { prefix: "└── ", method: ".check(amount)", arrow: "                 → ", returnType: "boolean" },
];

export default function APIReference() {
  return (
    <div>
      <h2
        id="api"
        className="font-[family-name:var(--font-instrument-serif)] text-3xl"
      >
        API reference
      </h2>
      <p className="text-muted text-sm mt-2">
        Complete API documentation for all 5 packages.
      </p>

      {/* SDK API tree */}
      <div className="mt-10">
        <p className="font-[family-name:var(--font-geist-mono)] text-sm font-medium text-blue-400 mb-4">
          SDK — @caypo/canton-sdk
        </p>
        <div className="space-y-4">
          <ApiTree lines={cantonClientLines} />
          <ApiTree lines={usdcxLines} />
          <ApiTree lines={safeguardLines} />
        </div>
      </div>

      {/* CLI Commands */}
      <div className="mt-10">
        <p className="font-[family-name:var(--font-geist-mono)] text-sm font-medium text-blue-400 mb-4">
          CLI — @caypo/canton-cli
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {CLI_COMMANDS.map((item) => (
            <div
              key={item.command}
              className="flex justify-between py-1.5 border-b border-border/30"
            >
              <span className="font-[family-name:var(--font-geist-mono)] text-[13px] text-foreground">
                {item.command}
              </span>
              <span className="text-[13px] text-muted">{item.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MCP Tools */}
      <div className="mt-10">
        <p className="font-[family-name:var(--font-geist-mono)] text-sm font-medium text-blue-400 mb-4">
          MCP — @caypo/canton-mcp (top 10 of 35)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {MCP_TOOLS_TOP.map((item) => (
            <div
              key={item.tool}
              className="flex justify-between py-1.5 border-b border-border/30"
            >
              <span className="font-[family-name:var(--font-geist-mono)] text-[13px] text-foreground">
                {item.tool}
              </span>
              <span className="text-[13px] text-muted">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
