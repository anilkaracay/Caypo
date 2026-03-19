/**
 * Canton MPP server — used by gateways to verify payments.
 *
 * Verification flow:
 * 1. Check network matches server config
 * 2. Check recipient matches server's party
 * 3. Fetch transaction from ledger by updateId
 * 4. Find Created Holding event for recipient, verify amount >= required
 * 5. Find Exercised event proving the sender executed the transfer
 * 6. Return receipt
 */

import { Method, Receipt, type CredentialData } from "mppx";
import { cantonMethod } from "./method.js";
import type { CantonCredentialPayload, CantonRequest } from "./schemas.js";

export type CantonNetwork = "mainnet" | "testnet" | "devnet";

export interface CantonMppServerConfig {
  ledgerUrl: string;
  token: string;
  userId: string;
  recipientPartyId: string;
  network: CantonNetwork;
}

export class MppVerificationError extends Error {
  readonly problemCode: string;

  constructor(message: string, problemCode: string) {
    super(message);
    this.name = "MppVerificationError";
    this.problemCode = problemCode;
  }
}

interface TransactionEvent {
  createdEvent?: {
    contractId: string;
    templateId: string;
    createArgument: Record<string, unknown>;
    witnessParties: string[];
    signatories: string[];
  };
  exercisedEvent?: {
    contractId: string;
    choice: string;
    actingParties: string[];
  };
}

interface TransactionData {
  updateId: string;
  eventsById?: Record<string, TransactionEvent>;
  rootEventIds?: string[];
}

function findCreatedHolding(
  tx: TransactionData,
  recipientParty: string,
): { amount: string } | null {
  const events = tx.eventsById ?? {};

  for (const evt of Object.values(events)) {
    if (evt.createdEvent) {
      const signatories = evt.createdEvent.signatories ?? [];
      const witnesses = evt.createdEvent.witnessParties ?? [];
      const allParties = [...signatories, ...witnesses];

      if (allParties.includes(recipientParty)) {
        const amount = evt.createdEvent.createArgument?.amount;
        if (typeof amount === "string") {
          return { amount };
        }
      }
    }
  }

  return null;
}

function findExercisedEvent(
  tx: TransactionData,
  senderParty: string,
): boolean {
  const events = tx.eventsById ?? {};

  for (const evt of Object.values(events)) {
    if (evt.exercisedEvent) {
      const acting = evt.exercisedEvent.actingParties ?? [];
      if (acting.includes(senderParty)) {
        return true;
      }
    }
  }

  return false;
}

export function cantonServer(config: CantonMppServerConfig) {
  return Method.toServer(cantonMethod, {
    async verify({
      credential,
    }: {
      credential: CredentialData<CantonCredentialPayload, CantonRequest>;
    }) {
      const { updateId, sender } = credential.payload;
      const { amount, recipient, network } = credential.challenge.request;

      // 1. Network check
      if (network !== config.network) {
        throw new MppVerificationError(
          `Network mismatch: credential is for ${network}, server is on ${config.network}`,
          "verification-failed",
        );
      }

      // 2. Recipient check
      if (recipient !== config.recipientPartyId) {
        throw new MppVerificationError(
          `Recipient mismatch: credential targets ${recipient}, server is ${config.recipientPartyId}`,
          "verification-failed",
        );
      }

      // 3. Fetch transaction by updateId
      const txResponse = await fetch(
        `${config.ledgerUrl}/v2/updates/transaction-by-id/${encodeURIComponent(updateId)}`,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        },
      );

      if (!txResponse.ok) {
        throw new MppVerificationError(
          "Transaction not found on Canton ledger",
          "verification-failed",
        );
      }

      const tx = (await txResponse.json()) as TransactionData;

      // 4. Find created Holding for recipient and verify amount
      const recipientHolding = findCreatedHolding(tx, config.recipientPartyId);
      if (!recipientHolding) {
        throw new MppVerificationError(
          "No holding created for recipient in transaction",
          "verification-failed",
        );
      }

      if (parseFloat(recipientHolding.amount) < parseFloat(amount)) {
        throw new MppVerificationError(
          `Payment insufficient: received ${recipientHolding.amount}, required ${amount}`,
          "payment-insufficient",
        );
      }

      // 5. Verify sender
      if (!findExercisedEvent(tx, sender)) {
        throw new MppVerificationError(
          `Sender mismatch: ${sender} did not execute the transfer`,
          "verification-failed",
        );
      }

      // 6. Return receipt
      return Receipt.from({
        method: "canton",
        reference: updateId,
        status: "success",
        timestamp: new Date().toISOString(),
      });
    },
  });
}
