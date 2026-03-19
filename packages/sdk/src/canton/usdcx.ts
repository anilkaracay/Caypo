/**
 * USDCx Operations — Query holdings, transfer, merge.
 *
 * Uses CIP-56 token standard:
 * - Splice.Api.Token.HoldingV1:Holding for balance queries
 * - TransferFactory_Transfer for 1-step transfers (requires TransferPreapproval)
 */

import { addAmounts, toCantonAmount } from "./amount.js";
import type { CantonClient } from "./client.js";
import { selectHoldings, type HoldingSelection, type USDCxHolding } from "./holdings.js";
import type { SubmitAndWaitResponse } from "./types.js";

/** CIP-56 Holding template ID — used for active contract queries */
export const USDCX_HOLDING_TEMPLATE_ID = "Splice.Api.Token.HoldingV1:Holding";

/** TransferFactory template ID for 1-step transfers */
export const TRANSFER_FACTORY_TEMPLATE_ID = "Splice.Api.Token.TransferFactoryV1:TransferFactory";

/** USDCx instrument identifier */
export const USDCX_INSTRUMENT_ID = "USDCx";

export interface TransferResult {
  updateId: string;
  completionOffset: number;
  commandId: string;
}

export interface TransferParams {
  recipient: string;
  amount: string;
  commandId?: string;
}

export class USDCxService {
  constructor(
    private readonly client: CantonClient,
    private readonly partyId: string,
  ) {}

  /**
   * Query all USDCx Holding contracts for this party.
   */
  async getHoldings(): Promise<USDCxHolding[]> {
    const offset = await this.client.getLedgerEnd();

    const contracts = await this.client.queryActiveContracts({
      filtersByParty: {
        [this.partyId]: {
          cumulative: [
            {
              identifierFilter: {
                TemplateFilter: {
                  value: { templateId: USDCX_HOLDING_TEMPLATE_ID },
                },
              },
            },
          ],
        },
      },
      activeAtOffset: offset,
    });

    return contracts.map((c) => ({
      contractId: c.contractId,
      owner: (c.createArgument.owner as string) ?? this.partyId,
      amount: c.createArgument.amount as string,
      templateId: c.templateId,
    }));
  }

  /**
   * Calculate total USDCx balance by summing all holding amounts.
   * Returns a string with up to 10 decimal places.
   */
  async getBalance(): Promise<string> {
    const holdings = await this.getHoldings();

    if (holdings.length === 0) {
      return "0";
    }

    let total = "0";
    for (const h of holdings) {
      total = addAmounts(total, h.amount);
    }

    return total;
  }

  /**
   * Transfer USDCx using TransferFactory_Transfer (1-step).
   * Requires the recipient to have an active TransferPreapproval.
   */
  async transfer(params: TransferParams): Promise<TransferResult> {
    const commandId = params.commandId ?? crypto.randomUUID();
    const amount = toCantonAmount(params.amount);

    // 1. Query holdings
    const holdings = await this.getHoldings();

    // 2. Select holdings covering the amount (throws InsufficientBalanceError if not enough)
    const selection: HoldingSelection = selectHoldings(holdings, params.amount);

    // 3. Build and submit ExerciseCommand for TransferFactory_Transfer
    const result: SubmitAndWaitResponse = await this.client.submitAndWait({
      commands: [
        {
          ExerciseCommand: {
            templateId: TRANSFER_FACTORY_TEMPLATE_ID,
            contractId: selection.contractIds[0],
            choice: "TransferFactory_Transfer",
            choiceArgument: {
              sender: this.partyId,
              receiver: params.recipient,
              amount,
              instrumentId: USDCX_INSTRUMENT_ID,
              inputHoldingCids: selection.contractIds,
              meta: {},
            },
          },
        },
      ],
      commandId,
      actAs: [this.partyId],
      readAs: [this.partyId],
    });

    return {
      updateId: result.updateId,
      completionOffset: result.completionOffset,
      commandId,
    };
  }

  /**
   * Merge multiple holdings into fewer UTXOs.
   * Returns the commandId of the merge transaction.
   */
  async mergeHoldings(holdingCids: string[]): Promise<string> {
    if (holdingCids.length < 2) {
      throw new Error("Need at least 2 holdings to merge");
    }

    const commandId = crypto.randomUUID();

    await this.client.submitAndWait({
      commands: [
        {
          ExerciseCommand: {
            templateId: USDCX_HOLDING_TEMPLATE_ID,
            contractId: holdingCids[0],
            choice: "Merge",
            choiceArgument: {
              holdingCids: holdingCids.slice(1),
            },
          },
        },
      ],
      commandId,
      actAs: [this.partyId],
    });

    return commandId;
  }
}
