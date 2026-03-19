/**
 * Holding selection algorithm for USDCx transfers.
 *
 * Canton uses a UTXO-like model: a party can have multiple Holding contracts.
 * When transferring, we need to select holdings that cover the required amount.
 */

import { addAmounts, compareAmounts } from "./amount.js";

export interface USDCxHolding {
  contractId: string;
  owner: string;
  amount: string;
  templateId: string;
}

export interface HoldingSelection {
  type: "single" | "merge-then-transfer";
  contractIds: string[];
}

export class InsufficientBalanceError extends Error {
  readonly available: string;
  readonly required: string;

  constructor(available: string, required: string) {
    super(`Insufficient balance: have ${available}, need ${required}`);
    this.name = "InsufficientBalanceError";
    this.available = available;
    this.required = required;
  }
}

/**
 * Select holdings that cover the required amount.
 *
 * Strategy:
 * 1. Sort holdings by amount descending.
 * 2. Look for a single holding >= required (prefer smallest sufficient one).
 * 3. If none, accumulate multiple holdings until we cover the amount.
 * 4. Throw InsufficientBalanceError if total < required.
 */
export function selectHoldings(
  holdings: USDCxHolding[],
  requiredAmount: string,
): HoldingSelection {
  if (holdings.length === 0) {
    throw new InsufficientBalanceError("0", requiredAmount);
  }

  // Sort descending by amount
  const sorted = [...holdings].sort((a, b) => compareAmounts(b.amount, a.amount));

  // 1. Try to find a single holding that covers the amount.
  //    Among all sufficient holdings, pick the smallest (best fit).
  let bestSingle: USDCxHolding | null = null;
  for (const h of sorted) {
    if (compareAmounts(h.amount, requiredAmount) >= 0) {
      // This one is sufficient — it might be the best fit
      // since we iterate descending, each subsequent one is smaller but still sufficient
      bestSingle = h;
    }
  }

  if (bestSingle) {
    return {
      type: "single",
      contractIds: [bestSingle.contractId],
    };
  }

  // 2. Accumulate multiple holdings (greedy — take largest first)
  let accumulated = "0";
  const selected: string[] = [];

  for (const h of sorted) {
    selected.push(h.contractId);
    accumulated = addAmounts(accumulated, h.amount);

    if (compareAmounts(accumulated, requiredAmount) >= 0) {
      return {
        type: "merge-then-transfer",
        contractIds: selected,
      };
    }
  }

  // 3. Not enough
  throw new InsufficientBalanceError(accumulated, requiredAmount);
}
