/**
 * Register all 20 prompts on the MCP server.
 * ALL prompts are fully implemented with tool orchestration instructions.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

interface PromptDef {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description: string; required?: boolean }>;
  handler: (args: Record<string, string>) => {
    messages: Array<{ role: string; content: { type: string; text: string } }>;
  };
}

function prompt(name: string, description: string, text: string): PromptDef {
  return {
    name,
    description,
    handler: () => ({ messages: [{ role: "user", content: { type: "text", text } }] }),
  };
}

const prompts: PromptDef[] = [
  // 1
  prompt("morning_briefing", "Daily financial briefing — balance, spending, traffic, alerts",
    `Good morning! Give me my daily CAYPO financial briefing.

Use these tools in order:
1. caypo_balance — current USDCx balance and holding count
2. caypo_safeguards — daily spending vs limits
3. caypo_traffic — validator traffic status
4. caypo_history (limit: 5) — recent transactions
5. caypo_earnings — savings yield earned
6. caypo_health — credit health factor (if any debt)

Format as a concise morning briefing:
- Lead with total balance
- Highlight daily spending vs limit
- Flag any warnings (low traffic, high debt, approaching limits)
- Show recent activity summary
- End with today's recommended actions`),

  // 2
  prompt("financial_report", "Comprehensive financial report with analysis and recommendations",
    `Generate a comprehensive CAYPO financial report.

Use these tools:
1. caypo_balance — checking balance
2. caypo_earnings — savings earnings
3. caypo_health — credit health
4. caypo_portfolio — investment positions
5. caypo_safeguards — spending limits and usage
6. caypo_history (limit: 20) — recent transactions
7. caypo_traffic — traffic status
8. caypo_rates — exchange rates

Analyze and report:
- Total net worth across all accounts (checking + savings + investments - debt)
- Spending patterns and trends
- Yield performance vs benchmarks
- Credit utilization and health
- Investment P&L
- Traffic consumption trend
- Specific recommendations for limit adjustments and optimization`),

  // 3
  prompt("what_if", "What-if scenario analysis for financial decisions",
    `I want to explore a financial scenario. Help me model it.

Use these tools to get current state:
1. caypo_balance — current checking balance
2. caypo_earnings — current yield
3. caypo_health — credit position
4. caypo_portfolio — investments
5. caypo_rates — current exchange rates

Then help me model scenarios like:
- "What if I deposit X more into savings?"
- "What if CC price increases/decreases by Y%?"
- "What if I borrow X against my collateral?"
- "What if I switch to a different investment strategy?"

For each scenario, calculate:
- Impact on total net worth
- Change in yield/earnings
- Effect on health factor
- Risk assessment

Ask me what scenario I'd like to explore.`),

  // 4
  prompt("optimize_yield", "Analyze positions and suggest yield optimization",
    `Analyze my current CAYPO positions and suggest how to optimize yield.

Use these tools in order:
1. caypo_balance — available USDCx in checking
2. caypo_earnings — current yield earnings
3. caypo_rates — current APYs and exchange rates
4. caypo_portfolio — investment positions
5. caypo_rebalance_savings — check if rebalancing would help

Then analyze:
- What percentage of my assets are earning yield vs sitting idle?
- Which protocols offer better rates right now?
- Should I move funds between savings and investments?
- How much more could I earn with optimization?
- Is there idle USDCx in checking that should be deployed?

Provide specific, actionable recommendations with expected yield improvements.`),

  // 5
  prompt("risk_assessment", "Assess risk across all positions and accounts",
    `Perform a comprehensive risk assessment of my CAYPO accounts.

Use these tools:
1. caypo_health — credit health factor and liquidation threshold
2. caypo_portfolio — investment exposure and P&L
3. caypo_balance — checking buffer
4. caypo_safeguards — spending controls
5. caypo_traffic — validator health
6. caypo_rates — market conditions

Assess these risks:
- Liquidation risk: how close is health factor to threshold?
- Concentration risk: is portfolio too concentrated in one asset?
- Liquidity risk: enough USDCx in checking for upcoming payments?
- Market risk: CC price exposure and potential downside
- Operational risk: traffic budget, safeguard settings
- Counterparty risk: protocol exposure

Rate each risk: LOW / MEDIUM / HIGH
Provide mitigation recommendations for any MEDIUM or HIGH risks.`),

  // 6
  prompt("investment_thesis", "Generate investment thesis for Canton assets",
    `Help me develop an investment thesis for Canton Network assets.

Use these tools for context:
1. caypo_rates — current CC/USDCx rates and trends
2. caypo_portfolio — my current positions
3. caypo_balance — available capital

Consider:
- Canton Network fundamentals (institutional adoption, privacy, compliance)
- CC tokenomics (Cantonomics — mining rewards, traffic burning)
- USDCx characteristics (Circle-backed, 1:1 USDC peg)
- Canton ecosystem growth (DTCC, Goldman, JPMorgan partnerships)
- Risk/reward profile for different allocation strategies

Produce:
- Bull/bear/base case for CC over next 6-12 months
- Recommended allocation based on risk tolerance
- Entry strategy (DCA vs lump sum)
- Position sizing relative to portfolio`),

  // 7
  prompt("rebalance_plan", "Create portfolio rebalance plan",
    `Create a rebalance plan for my CAYPO portfolio.

Use these tools:
1. caypo_portfolio — current positions and allocations
2. caypo_rates — current prices
3. caypo_balance — available capital
4. caypo_earnings — yield positions

Compare current allocation to target strategies:
- institutional: 40% CC / 60% USDCx
- balanced: 50% CC / 50% USDCx
- cc-heavy: 80% CC / 20% USDCx
- stable-yield: 100% USDCx

For each strategy, calculate:
- Trades needed to reach target
- Estimated trading fees
- Impact on yield
- Risk change

Recommend the best strategy based on my current situation and risk profile.
Then ask if I want to execute the rebalance.`),

  // 8
  prompt("savings_strategy", "Develop optimal savings strategy",
    `Help me develop an optimal savings strategy for my CAYPO account.

Use these tools:
1. caypo_balance — available USDCx
2. caypo_earnings — current savings yield
3. caypo_rates — available APYs
4. caypo_safeguards — spending patterns

Analyze:
- How much should stay in checking as buffer? (recommend 2-4 weeks of spending)
- How much should go to savings for yield?
- Which yield protocol offers the best risk-adjusted return?
- Should I use auto-deposit on a schedule?

Create a specific plan:
1. Emergency buffer amount (based on spending history)
2. Savings allocation (amount and protocol)
3. Review schedule (weekly/monthly)
4. Rebalance triggers (APY change > 0.5%, etc.)`),

  // 9
  prompt("credit_health", "Detailed credit health assessment and recommendations",
    `Perform a detailed credit health assessment.

Use these tools:
1. caypo_health — health factor, collateral, debt, limits
2. caypo_earnings — collateral yield
3. caypo_balance — available for repayment
4. caypo_rates — current borrow rate

Assess:
- Current health factor vs safe range (target: > 2.0)
- Collateral coverage ratio
- Interest accrual rate and projected 30-day cost
- Liquidation price/threshold proximity
- Debt service capability (can current yield cover interest?)

Recommendations:
- Should I add more collateral?
- Should I repay some debt?
- Is the borrow rate competitive?
- Warning thresholds to set up`),

  // 10
  prompt("spending_analysis", "Analyze spending patterns and suggest optimizations",
    `Analyze my CAYPO spending patterns.

Use these tools:
1. caypo_history (limit: 50) — transaction history
2. caypo_safeguards — spending limits and daily usage
3. caypo_balance — current balance

Analyze:
- Total spending by category (API calls, transfers, etc.)
- Identify the most expensive API services used
- Daily/weekly spending trends
- Peak usage times
- Average transaction size

Suggest:
- Are safeguard limits set appropriately?
- Which API calls could be optimized (batch, cache, cheaper alternatives)?
- Should spending limits be adjusted?
- Cost reduction opportunities`),

  // 11
  prompt("traffic_report", "Detailed validator traffic consumption report",
    `Generate a detailed traffic report for my Canton validator.

Use these tools:
1. caypo_traffic — current traffic balance
2. caypo_history (limit: 20) — recent transactions
3. caypo_balance — to estimate remaining operations

Report:
- Current traffic: purchased, consumed, remaining
- Consumption rate (estimated ops/day)
- Days until traffic runs out at current rate
- Cost analysis (CC spent on traffic vs value of operations)
- Auto-purchase configuration status

Recommendations:
- Should auto-purchase be enabled/adjusted?
- Optimal traffic purchase amount
- When to purchase more (threshold suggestion)`),

  // 12
  prompt("market_overview", "Canton ecosystem market overview",
    `Provide a Canton ecosystem market overview.

Use these tools:
1. caypo_rates — current CC/USDCx exchange rates and 24h changes
2. caypo_services — available MPP gateway services and pricing
3. caypo_traffic — network health indicator

Cover:
- CC price and recent trend
- USDCx status (peg stability)
- Available services on the gateway (new additions?)
- Network activity indicators (traffic, ledger advancement)
- Canton ecosystem news context (partners, upgrades, DeFi launches)
- How current conditions affect my positions

End with: opportunities and risks to watch.`),

  // 13
  prompt("portfolio_review", "Quarterly-style investment portfolio review",
    `Conduct a quarterly-style portfolio review.

Use these tools:
1. caypo_portfolio — full portfolio with P&L
2. caypo_rates — current market prices
3. caypo_earnings — yield earned
4. caypo_health — credit position
5. caypo_balance — checking balance

Review format:
1. Portfolio Summary
   - Total value, total cost, total P&L, P&L %
   - Asset breakdown with individual performance
2. Performance Attribution
   - What drove gains/losses?
   - Yield contribution
3. Risk Metrics
   - Concentration, volatility exposure, health factor
4. Benchmark Comparison
   - vs holding 100% USDCx (stable baseline)
   - vs balanced strategy
5. Forward Outlook
   - Rebalance needed?
   - Strategy adjustments for next quarter`),

  // 14
  prompt("defi_opportunities", "Discover DeFi opportunities on Canton Network",
    `Scout DeFi opportunities on Canton Network for my CAYPO account.

Use these tools:
1. caypo_balance — available capital
2. caypo_rates — current yields and rates
3. caypo_earnings — current yield performance
4. caypo_portfolio — existing positions

Evaluate opportunities:
- Savings protocols: which offers best APY?
- Lending: is there arbitrage between borrow rate and yield?
- Exchange: any CC accumulation opportunities at current price?
- Rewards: CC mining reward rates
- New protocol launches on Canton

For each opportunity:
- Expected return
- Risk level
- Capital required
- How to execute (which tools to call)

Rank by risk-adjusted return.`),

  // 15
  prompt("weekly_summary", "Weekly financial summary and highlights",
    `Generate my weekly CAYPO financial summary.

Use these tools:
1. caypo_balance — current balance
2. caypo_history (limit: 50) — this week's transactions
3. caypo_earnings — yield earned this week
4. caypo_portfolio — investment performance
5. caypo_safeguards — spending vs limits

Weekly Summary format:
- Opening balance → Closing balance (net change)
- Total transactions and volume
- Top spending categories
- Yield earned this week
- Investment P&L this week
- Safeguard utilization (% of daily limit used on average)
- Notable events or alerts
- Next week: upcoming payments, rebalance needed, limits to adjust`),

  // 16
  prompt("budget_plan", "Create a spending budget plan",
    `Help me create a spending budget for my CAYPO account.

Use these tools:
1. caypo_balance — available funds
2. caypo_history (limit: 50) — spending patterns
3. caypo_safeguards — current limits
4. caypo_earnings — income from yield

Create a budget plan:
1. Income Estimate
   - Savings yield (monthly)
   - CC rewards (monthly)
2. Fixed Costs
   - Regular API usage (based on history)
   - Traffic costs
3. Variable Budget
   - Discretionary API calls
   - New service trials
4. Savings Target
   - Recommended monthly savings amount
5. Safeguard Settings
   - Recommended tx limit (based on budget)
   - Recommended daily limit

Suggest caypo_set_limit calls to implement the budget.`),

  // 17
  prompt("tax_summary", "Transaction summary for tax reporting",
    `Generate a tax-relevant transaction summary.

Use these tools:
1. caypo_history (limit: 50) — all transactions
2. caypo_portfolio — realized gains/losses
3. caypo_earnings — yield income

Produce:
1. Transaction Log
   - All USDCx transfers (in/out, counterparty, amount, date)
   - All swaps (from/to, amounts, gain/loss)
2. Income Summary
   - Yield earned (by protocol)
   - CC rewards received
3. Capital Gains/Losses
   - Realized P&L from sales
   - Cost basis tracking
4. Summary Totals
   - Total income
   - Total realized gains
   - Total fees paid

Note: This is informational only. Consult a tax professional for actual filing.`),

  // 18
  prompt("onboarding", "New user guide — explain CAYPO features and walk through setup",
    `Welcome to CAYPO — your agent finance platform on Canton Network!

Let me walk you through everything. Use these tools to explore:

1. **Your Address**: Call caypo_address to see your Canton party ID
2. **Balance**: Call caypo_balance to check your USDCx balance
3. **Safeguards**: Call caypo_safeguards to review spending limits

Key concepts to explain:
- Canton uses party IDs (Name::hexfingerprint), not addresses
- USDCx is USDC-backed stablecoin via Circle xReserve (1:1 peg)
- CC is Canton Coin — the native utility token for traffic and rewards
- Amounts are always strings — Canton uses Numeric 10 (10 decimal places)
- Traffic replaces gas — validator-level budgets, not per-tx fees
- Safeguards protect against overspending (per-tx and daily limits)

Available accounts:
- **Checking**: Send/receive USDCx, pay for APIs
- **Savings**: Earn yield on idle USDCx
- **Credit**: Borrow against savings collateral
- **Exchange**: Swap between USDCx and CC
- **Investment**: Portfolio management with strategies and DCA

Show available gateway services with caypo_services.
Set appropriate safeguard limits based on intended usage.`),

  // 19
  prompt("troubleshoot", "Diagnose and fix common CAYPO issues",
    `Help me troubleshoot a CAYPO issue.

Run these diagnostic checks:
1. caypo_balance — is balance correct?
2. caypo_traffic — is traffic sufficient for transactions?
3. caypo_safeguards — is wallet locked? Are limits blocking?
4. caypo_health — any credit issues?
5. caypo_address — correct network?

Common issues and fixes:
- "Transaction rejected": Check safeguards (locked? limit exceeded?)
- "Insufficient balance": Check if funds are in savings/investments
- "Traffic error": Traffic budget depleted, purchase more CC
- "Payment failed": Gateway unreachable or invalid credential
- "Network mismatch": Credential for wrong network (mainnet vs devnet)
- "Health factor low": Add collateral or repay some debt

For each issue found:
1. Identify the root cause
2. Suggest the exact tool call to fix it
3. Verify the fix worked

Ask me what problem I'm experiencing.`),

  // 20
  prompt("security_audit", "Comprehensive security audit of agent wallet",
    `Perform a comprehensive security audit of my CAYPO agent.

Run these checks:
1. caypo_safeguards — are limits set? Is wallet lockable?
2. caypo_traffic — is traffic healthy?
3. caypo_balance — holding count (too many UTXOs = merge needed)
4. caypo_address — verify network
5. caypo_health — any dangerous debt levels?
6. caypo_history (limit: 10) — any suspicious transactions?

Security checklist:
- [ ] Per-tx limit set and reasonable (< 10% of balance)
- [ ] Daily limit set and reasonable
- [ ] Wallet is unlocked (or locked when not in use)
- [ ] Traffic balance sufficient (> 1000)
- [ ] UTXO count manageable (< 10, suggest merge if higher)
- [ ] Health factor safe (> 2.0 if borrowing)
- [ ] No unexpected transactions in history
- [ ] Network matches expected (mainnet/testnet/devnet)

Rate overall security: GOOD / NEEDS ATTENTION / CRITICAL
Provide specific action items for any issues.`),
];

export function registerPrompts(server: Server): void {
  const promptMap = new Map<string, PromptDef>();
  for (const p of prompts) {
    promptMap.set(p.name, p);
  }

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: prompts.map((p) => ({
      name: p.name,
      description: p.description,
      arguments: p.arguments,
    })),
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const prompt = promptMap.get(request.params.name);
    if (!prompt) {
      throw new Error(`Unknown prompt: ${request.params.name}`);
    }
    return prompt.handler((request.params.arguments ?? {}) as Record<string, string>);
  });
}
