/**
 * MppPayClient — automatic HTTP 402 payment handling.
 *
 * Flow:
 * 1. Fetch URL
 * 2. If 402, parse WWW-Authenticate header for canton payment challenge
 * 3. Check maxPrice against challenge amount
 * 4. Check safeguards
 * 5. Execute USDCx transfer via TransferFactory_Transfer
 * 6. Build credential (base64-encoded payload)
 * 7. Retry request with Authorization: Payment <credential>
 * 8. Return { response, receipt?, paid }
 */

import { compareAmounts } from "../canton/amount.js";
import type { USDCxService } from "../canton/usdcx.js";
import { toCantonAmount } from "../canton/amount.js";
import type { SafeguardManager } from "../safeguards/manager.js";

export interface PayOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  maxPrice?: string;
}

export interface PayResult {
  response: Response;
  paid: boolean;
  receipt?: {
    updateId: string;
    completionOffset: number;
    commandId: string;
    amount: string;
  };
}

export interface PaymentChallenge {
  amount: string;
  currency: string;
  recipient: string;
  network: string;
  description?: string;
}

/**
 * Parse a WWW-Authenticate header for Canton payment parameters.
 *
 * Expected format:
 *   Payment method="canton", amount="0.01", currency="USDCx",
 *   recipient="Gateway::1220...", network="mainnet"
 */
export function parseWwwAuthenticate(header: string): PaymentChallenge | null {
  if (!header.startsWith("Payment")) {
    return null;
  }

  const params: Record<string, string> = {};
  const re = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = re.exec(header)) !== null) {
    params[match[1]] = match[2];
  }

  if (params.method !== "canton" || !params.amount || !params.recipient || !params.network) {
    return null;
  }

  return {
    amount: params.amount,
    currency: params.currency ?? "USDCx",
    recipient: params.recipient,
    network: params.network,
    description: params.description,
  };
}

export class MppPayClient {
  constructor(
    private readonly usdcx: USDCxService,
    private readonly safeguards: SafeguardManager,
    private readonly partyId: string,
    private readonly network: string,
  ) {}

  /**
   * Pay for an API call via MPP 402 flow.
   * If the response is not 402, returns it as-is with paid=false.
   */
  async pay(url: string, opts?: PayOptions): Promise<PayResult> {
    const requestInit: RequestInit = {
      method: opts?.method ?? "GET",
      headers: opts?.headers,
      body: opts?.body,
    };

    // 1. Initial request
    const firstResponse = await fetch(url, requestInit);

    if (firstResponse.status !== 402) {
      return { response: firstResponse, paid: false };
    }

    // 2. Parse 402 challenge
    const authHeader = firstResponse.headers.get("WWW-Authenticate") ?? "";
    const challenge = parseWwwAuthenticate(authHeader);

    if (!challenge) {
      throw new Error("402 received but no valid Canton payment challenge in WWW-Authenticate");
    }

    // 3. Network check
    if (challenge.network !== this.network) {
      throw new Error(
        `Network mismatch: challenge requires ${challenge.network}, agent on ${this.network}`,
      );
    }

    // 4. Price check
    if (opts?.maxPrice && compareAmounts(challenge.amount, opts.maxPrice) > 0) {
      throw new Error(
        `Price ${challenge.amount} exceeds maxPrice ${opts.maxPrice}`,
      );
    }

    // 5. Safeguard check
    const check = this.safeguards.check(challenge.amount);
    if (!check.allowed) {
      throw new Error(`Safeguard rejected: ${check.reason}`);
    }

    // 6. Execute USDCx transfer
    const transferResult = await this.usdcx.transfer({
      recipient: challenge.recipient,
      amount: challenge.amount,
    });

    // 7. Record spend
    this.safeguards.recordSpend(challenge.amount);

    // 8. Build credential and retry
    const credential = Buffer.from(
      JSON.stringify({
        updateId: transferResult.updateId,
        completionOffset: transferResult.completionOffset,
        sender: this.partyId,
        commandId: transferResult.commandId,
      }),
    ).toString("base64");

    const retryResponse = await fetch(url, {
      ...requestInit,
      headers: {
        ...opts?.headers,
        Authorization: `Payment ${credential}`,
      },
    });

    return {
      response: retryResponse,
      paid: true,
      receipt: {
        updateId: transferResult.updateId,
        completionOffset: transferResult.completionOffset,
        commandId: transferResult.commandId,
        amount: challenge.amount,
      },
    };
  }
}
