#!/usr/bin/env npx tsx
/**
 * Set up TransferPreapproval for the CAYPO Gateway party.
 *
 * This enables agents to do 1-step transfers to the gateway.
 * Only needs to run once (renew annually — $1/year fee).
 *
 * Usage:
 *   npx tsx scripts/setup-preapproval.ts
 *   CANTON_LEDGER_URL=http://... npx tsx scripts/setup-preapproval.ts
 */

const CANTON_URL = process.env.CANTON_LEDGER_URL ?? "http://172.18.0.7:7575";
const CANTON_JWT = process.env.CANTON_JWT ?? "";
const GATEWAY_PARTY = process.env.GATEWAY_PARTY_ID ?? "";

async function main() {
  console.log("\n  CAYPO TransferPreapproval Setup");
  console.log("  ================================\n");

  if (!GATEWAY_PARTY) {
    console.log("  Error: GATEWAY_PARTY_ID environment variable required.");
    console.log("  Set it to your gateway's Canton party ID.\n");
    console.log("  Example:");
    console.log("    GATEWAY_PARTY_ID='Gateway::1220...' npx tsx scripts/setup-preapproval.ts\n");
    process.exit(1);
  }

  console.log(`  Canton URL:     ${CANTON_URL}`);
  console.log(`  Gateway Party:  ${GATEWAY_PARTY}\n`);

  // 1. Verify Canton connectivity
  console.log("  [1/3] Checking Canton connectivity...");
  try {
    const res = await fetch(`${CANTON_URL}/livez`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log("  [OK] Canton is reachable\n");
  } catch (err) {
    console.log(`  [FAIL] Cannot reach Canton at ${CANTON_URL}`);
    console.log(`  Error: ${(err as Error).message}\n`);
    process.exit(1);
  }

  // 2. Verify the party exists
  console.log("  [2/3] Verifying gateway party...");
  try {
    const res = await fetch(`${CANTON_URL}/v2/parties`, {
      headers: CANTON_JWT ? { Authorization: `Bearer ${CANTON_JWT}` } : {},
    });
    if (res.ok) {
      const data = (await res.json()) as { partyDetails: Array<{ party: string }> };
      const found = data.partyDetails.some((p) => p.party === GATEWAY_PARTY);
      if (found) {
        console.log("  [OK] Gateway party found on ledger\n");
      } else {
        console.log("  [WARN] Party not found in list (may still be valid)\n");
      }
    }
  } catch {
    console.log("  [WARN] Could not verify party (non-critical)\n");
  }

  // 3. TransferPreapproval setup
  console.log("  [3/3] TransferPreapproval...");
  console.log("");
  console.log("  The TransferPreapproval contract enables 1-step transfers from agents.");
  console.log("  Setup options:");
  console.log("");
  console.log("  Option A: Via Splice Wallet Gateway (if using Splice validator)");
  console.log("    POST /v0/admin/external-party/setup-proposal");
  console.log("");
  console.log("  Option B: Via Canton Ledger API (direct)");
  console.log("    Exercise the TransferPreapproval creation choice");
  console.log("    on the token registry for your party.");
  console.log("");
  console.log("  Option C: Via Wallet Web UI");
  console.log("    Navigate to the wallet UI and enable 'Accept Transfers'");
  console.log("    for the gateway party.");
  console.log("");
  console.log("  Notes:");
  console.log("    - Fee: $1/year (controlled by super validators)");
  console.log("    - Renew before expiry to avoid payment disruption");
  console.log("    - Once active, agents can transfer USDCx in a single transaction");
  console.log("");
  console.log("  After setup, verify by checking active contracts for the party.");
  console.log("  The TransferPreapproval template ID:");
  console.log("    Splice.Api.Token.TransferPreapprovalV1:TransferPreapproval");
  console.log("");
}

main().catch(console.error);
