export interface DemoScenario {
  id: string;
  label: string;
  tagline: string;
  accountsCovered: string[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  { id: "earn-save", label: "Agent earns and saves", tagline: "Receive payment, auto-deposit 80% to savings", accountsCovered: ["checking", "savings"] },
  { id: "borrow-compute", label: "Borrow and pay for compute", tagline: "Credit line, GPU inference, earn, repay", accountsCovered: ["checking", "savings", "credit"] },
  { id: "swap-invest", label: "Swap and invest", tagline: "Convert USDCx to CC, invest in strategy", accountsCovered: ["checking", "exchange", "investment"] },
  { id: "multi-agent", label: "Multi-agent settlement", tagline: "Agent A pays Agent B for completed work", accountsCovered: ["checking", "savings", "safeguards"] },
];
