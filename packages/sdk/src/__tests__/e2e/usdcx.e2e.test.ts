/**
 * USDCx E2E tests — runs against a Canton sandbox with USDCx DAR deployed.
 * Skipped if Canton is unreachable or USDCx Holding template is not found.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { CantonClient } from "../../canton/client.js";
import { USDCxService, USDCX_HOLDING_TEMPLATE_ID } from "../../canton/usdcx.js";
import { getCantonConnection, createTestClient, createTestParty } from "./setup.js";

let client: CantonClient;
let cantonAvailable = false;
let usdcxAvailable = false;
let testParty = "";
let usdcxService: USDCxService;

beforeAll(async () => {
  const conn = await getCantonConnection();
  cantonAvailable = conn.isAvailable;

  if (!cantonAvailable) return;

  client = createTestClient(conn.ledgerUrl);
  testParty = await createTestParty(client, "usdcx-e2e");
  usdcxService = new USDCxService(client, testParty);

  // Check if USDCx Holding template is available on the ledger
  try {
    const offset = await client.getLedgerEnd();
    await client.queryActiveContracts({
      filtersByParty: {
        [testParty]: {
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
    usdcxAvailable = true;
  } catch {
    // Template not found — USDCx DAR not deployed
    usdcxAvailable = false;
  }
});

describe.skipIf(!cantonAvailable)("USDCx E2E — Canton available", () => {
  it("should query USDCx holdings (may be empty)", async () => {
    const holdings = await usdcxService.getHoldings();
    expect(Array.isArray(holdings)).toBe(true);
  });

  it("should return balance as a valid string", async () => {
    const balance = await usdcxService.getBalance();
    expect(typeof balance).toBe("string");
    expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
  });

  it("should handle party with no holdings gracefully", async () => {
    const freshParty = await createTestParty(client, "usdcx-empty");
    const freshService = new USDCxService(client, freshParty);

    const holdings = await freshService.getHoldings();
    expect(holdings).toEqual([]);

    const balance = await freshService.getBalance();
    expect(balance).toBe("0");
  });
});

describe.skipIf(!usdcxAvailable)("USDCx E2E — with USDCx DAR", () => {
  it("should execute USDCx transfer between two parties", async () => {
    const balance = await usdcxService.getBalance();

    if (parseFloat(balance) < 0.01) {
      console.log("Skipping transfer test — insufficient balance:", balance);
      return;
    }

    const recipient = await createTestParty(client, "usdcx-recipient");
    const result = await usdcxService.transfer({
      recipient,
      amount: "0.01",
    });

    expect(result.updateId).toBeTruthy();
    expect(result.completionOffset).toBeGreaterThan(0);
    expect(result.commandId).toBeTruthy();

    // Verify recipient received the funds
    const recipientService = new USDCxService(client, recipient);
    const recipientBalance = await recipientService.getBalance();
    expect(parseFloat(recipientBalance)).toBeGreaterThanOrEqual(0.01);
  });

  it("should merge holdings when party has multiple", async () => {
    const holdings = await usdcxService.getHoldings();

    if (holdings.length < 2) {
      console.log("Skipping merge test — need 2+ holdings, have:", holdings.length);
      return;
    }

    const holdingCids = holdings.slice(0, 2).map((h) => h.contractId);
    const commandId = await usdcxService.mergeHoldings(holdingCids);
    expect(commandId).toBeTruthy();
  });
});
