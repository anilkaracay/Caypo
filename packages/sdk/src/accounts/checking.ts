/**
 * CheckingAccount — high-level USDCx checking account.
 *
 * Wraps USDCxService with safeguard checks and transaction history.
 */

import type { CantonClient } from "../canton/client.js";
import type { USDCxService } from "../canton/usdcx.js";
import type { TransferResult } from "../canton/usdcx.js";
import type { SafeguardManager } from "../safeguards/manager.js";

export interface SendOptions {
  memo?: string;
  commandId?: string;
}

export interface TransactionRecord {
  updateId: string;
  commandId: string;
  effectiveAt: string;
  offset: number;
  type: "send" | "receive" | "unknown";
  amount?: string;
  counterparty?: string;
}

export class CheckingAccount {
  constructor(
    private readonly usdcx: USDCxService,
    private readonly safeguards: SafeguardManager,
    private readonly client: CantonClient,
    private readonly partyId: string,
  ) {}

  /** Get USDCx balance: total available and number of UTXO holdings. */
  async balance(): Promise<{ available: string; holdingCount: number }> {
    const holdings = await this.usdcx.getHoldings();
    let available = "0";

    // Use addAmounts from the holdings themselves
    const { addAmounts } = await import("../canton/amount.js");
    for (const h of holdings) {
      available = addAmounts(available, h.amount);
    }

    return { available, holdingCount: holdings.length };
  }

  /**
   * Send USDCx to a recipient.
   * Checks safeguards before executing the transfer.
   */
  async send(
    recipient: string,
    amount: string,
    opts?: SendOptions,
  ): Promise<TransferResult> {
    // 1. Check safeguards
    const check = this.safeguards.check(amount);
    if (!check.allowed) {
      throw new Error(`Safeguard rejected: ${check.reason}`);
    }

    // 2. Execute transfer
    const result = await this.usdcx.transfer({
      recipient,
      amount,
      commandId: opts?.commandId,
    });

    // 3. Record spend
    this.safeguards.recordSpend(amount);

    return result;
  }

  /** Party ID for receiving payments. */
  address(): string {
    return this.partyId;
  }

  /**
   * Query transaction history via /v2/updates/flats.
   * Returns recent flat transactions involving this party.
   */
  async history(opts?: { limit?: number }): Promise<TransactionRecord[]> {
    const limit = opts?.limit ?? 20;
    const offset = await this.client.getLedgerEnd();

    // Query recent transactions using active contracts approach
    // Note: full streaming history requires WebSocket /v2/updates/flats
    // For now, return what we can derive from recent contract state
    const contracts = await this.client.queryActiveContracts({
      filtersByParty: {
        [this.partyId]: {
          cumulative: [
            {
              identifierFilter: {
                WildcardFilter: { value: { includeCreatedEventBlob: false } },
              },
            },
          ],
        },
      },
      activeAtOffset: offset,
    });

    // Map contracts to transaction records (limited view — full history needs WebSocket streaming)
    return contracts.slice(0, limit).map((c) => ({
      updateId: "",
      commandId: "",
      effectiveAt: c.createdAt,
      offset: 0,
      type: "unknown" as const,
      amount: typeof c.createArgument.amount === "string" ? c.createArgument.amount : undefined,
    }));
  }
}
