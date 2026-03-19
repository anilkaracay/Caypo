/**
 * MPP payment middleware for Hono.
 *
 * For each request:
 * 1. Check for Authorization: Payment header
 * 2. If absent, return 402 with WWW-Authenticate challenge
 * 3. If present, verify payment credential via Canton ledger
 * 4. If valid, proxy to upstream and attach receipt
 */

import type { Context, Next } from "hono";

const GATEWAY_PARTY = process.env.GATEWAY_PARTY_ID ?? "";
const GATEWAY_NETWORK = process.env.GATEWAY_NETWORK ?? "testnet";

export interface MppGateOptions {
  amount: string;
  currency?: string;
  description?: string;
}

/**
 * Create MPP payment gate middleware.
 * Returns 402 if no valid payment, otherwise proceeds.
 */
export function mppGate(opts: MppGateOptions) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization") ?? "";

    if (!authHeader.startsWith("Payment ")) {
      // Return 402 with challenge
      const challenge = [
        `Payment method="canton"`,
        `amount="${opts.amount}"`,
        `currency="${opts.currency ?? "USDCx"}"`,
        `recipient="${GATEWAY_PARTY}"`,
        `network="${GATEWAY_NETWORK}"`,
      ];

      if (opts.description) {
        challenge.push(`description="${opts.description}"`);
      }

      return c.text("Payment Required", 402, {
        "WWW-Authenticate": challenge.join(", "),
      });
    }

    // Extract and verify credential
    const credentialBase64 = authHeader.replace("Payment ", "");

    try {
      const credential = JSON.parse(
        Buffer.from(credentialBase64, "base64").toString("utf-8"),
      ) as {
        updateId: string;
        completionOffset: number;
        sender: string;
        commandId: string;
      };

      // Verify via Canton Ledger API
      const ledgerUrl = process.env.CANTON_LEDGER_URL ?? "http://localhost:7575";
      const ledgerToken = process.env.CANTON_JWT ?? "";

      const txResponse = await fetch(
        `${ledgerUrl}/v2/updates/transaction-by-id/${encodeURIComponent(credential.updateId)}`,
        { headers: { Authorization: `Bearer ${ledgerToken}` } },
      );

      if (!txResponse.ok) {
        return c.json({ error: "Payment verification failed", code: "verification-failed" }, 402);
      }

      // Attach receipt to response headers after proxying
      c.set("paymentReceipt", {
        method: "canton",
        reference: credential.updateId,
        status: "success",
        amount: opts.amount,
        sender: credential.sender,
      });

      await next();

      // Add receipt header to response
      c.header(
        "Payment-Receipt",
        Buffer.from(JSON.stringify(c.get("paymentReceipt"))).toString("base64"),
      );
    } catch {
      return c.json({ error: "Invalid payment credential", code: "malformed-credential" }, 402);
    }
  };
}
