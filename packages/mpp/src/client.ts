/**
 * Canton MPP client — used by agents to pay for services.
 *
 * Flow:
 * 1. Receive 402 challenge with amount, recipient, network
 * 2. Validate network matches agent config
 * 3. Query agent's USDCx holdings via Ledger API
 * 4. Select holdings covering the required amount
 * 5. Exercise TransferFactory_Transfer (1-step, requires recipient TransferPreapproval)
 * 6. Return serialized credential with updateId + completionOffset
 */

import { Credential, Method, type Challenge } from "mppx";
import { cantonMethod } from "./method.js";
import type { CantonRequest } from "./schemas.js";

const USDCX_HOLDING_TEMPLATE_ID = "Splice.Api.Token.HoldingV1:Holding";
const TRANSFER_FACTORY_TEMPLATE_ID = "Splice.Api.Token.TransferFactoryV1:TransferFactory";
const USDCX_INSTRUMENT_ID = "USDCx";

export type CantonNetwork = "mainnet" | "testnet" | "devnet";

export interface CantonMppClientConfig {
  ledgerUrl: string;
  token: string;
  userId: string;
  partyId: string;
  network: CantonNetwork;
}

interface HoldingContract {
  contractId: string;
  amount: string;
}

async function fetchJson(url: string, token: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Canton API error: HTTP ${response.status} — ${text}`);
  }

  return response.json();
}

async function getLedgerEnd(config: CantonMppClientConfig): Promise<number> {
  const data = (await fetchJson(`${config.ledgerUrl}/v2/state/ledger-end`, config.token)) as {
    offset: number;
  };
  return data.offset;
}

async function queryHoldings(config: CantonMppClientConfig): Promise<HoldingContract[]> {
  const offset = await getLedgerEnd(config);

  const data = (await fetchJson(`${config.ledgerUrl}/v2/state/active-contracts`, config.token, {
    method: "POST",
    body: JSON.stringify({
      eventFormat: {
        filtersByParty: {
          [config.partyId]: {
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
        verbose: true,
      },
      activeAtOffset: offset,
    }),
  })) as {
    contractEntry?: Array<{
      createdEvent?: { contractId: string; createArgument: { amount: string } };
    }>;
  };

  return (data.contractEntry ?? [])
    .filter((e) => e.createdEvent != null)
    .map((e) => ({
      contractId: e.createdEvent!.contractId,
      amount: e.createdEvent!.createArgument.amount,
    }));
}

function selectHoldings(
  holdings: HoldingContract[],
  requiredAmount: string,
): string[] {
  if (holdings.length === 0) {
    throw new Error(`Insufficient balance: no holdings available`);
  }

  // Sort descending
  const sorted = [...holdings].sort(
    (a, b) => parseFloat(b.amount) - parseFloat(a.amount),
  );

  // Try single holding
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (parseFloat(sorted[i].amount) >= parseFloat(requiredAmount)) {
      return [sorted[i].contractId];
    }
  }

  // Accumulate multiple
  let total = 0;
  const selected: string[] = [];
  for (const h of sorted) {
    selected.push(h.contractId);
    total += parseFloat(h.amount);
    if (total >= parseFloat(requiredAmount)) {
      return selected;
    }
  }

  throw new Error(
    `Insufficient balance: have ${total}, need ${requiredAmount}`,
  );
}

export function cantonClient(config: CantonMppClientConfig) {
  return Method.toClient(cantonMethod, {
    async createCredential({ challenge }: { challenge: Challenge<CantonRequest> }) {
      // 1. Validate network
      if (challenge.request.network !== config.network) {
        throw new Error(
          `Network mismatch: challenge requires ${challenge.request.network}, agent configured for ${config.network}`,
        );
      }

      // 2. Query holdings
      const holdings = await queryHoldings(config);

      // 3. Select holdings covering amount
      const selectedCids = selectHoldings(holdings, challenge.request.amount);

      // 4. Generate commandId
      const commandId = crypto.randomUUID();

      // 5. Exercise TransferFactory_Transfer
      const result = (await fetchJson(
        `${config.ledgerUrl}/v2/commands/submit-and-wait`,
        config.token,
        {
          method: "POST",
          body: JSON.stringify({
            commands: [
              {
                ExerciseCommand: {
                  templateId: TRANSFER_FACTORY_TEMPLATE_ID,
                  contractId: selectedCids[0],
                  choice: "TransferFactory_Transfer",
                  choiceArgument: {
                    sender: config.partyId,
                    receiver: challenge.request.recipient,
                    amount: challenge.request.amount,
                    instrumentId: USDCX_INSTRUMENT_ID,
                    inputHoldingCids: selectedCids,
                    meta: {},
                  },
                },
              },
            ],
            userId: config.userId,
            commandId,
            actAs: [config.partyId],
            readAs: [config.partyId],
          }),
        },
      )) as { updateId: string; completionOffset: number };

      // 6. Return serialized credential
      return Credential.serialize({
        challenge,
        payload: {
          updateId: result.updateId,
          completionOffset: result.completionOffset,
          sender: config.partyId,
          commandId,
        },
      });
    },
  });
}
