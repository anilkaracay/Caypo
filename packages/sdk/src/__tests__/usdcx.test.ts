import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CantonClient } from "../canton/client.js";
import { InsufficientBalanceError, selectHoldings, type USDCxHolding } from "../canton/holdings.js";
import {
  TRANSFER_FACTORY_TEMPLATE_ID,
  USDCX_HOLDING_TEMPLATE_ID,
  USDCX_INSTRUMENT_ID,
  USDCxService,
} from "../canton/usdcx.js";

// ---------------------------------------------------------------------------
// Mock CantonClient
// ---------------------------------------------------------------------------

function mockClient(overrides?: Partial<CantonClient>): CantonClient {
  return {
    getLedgerEnd: vi.fn().mockResolvedValue(42),
    queryActiveContracts: vi.fn().mockResolvedValue([]),
    submitAndWait: vi.fn().mockResolvedValue({ updateId: "upd-1", completionOffset: 43 }),
    submitAndWaitForTransaction: vi.fn(),
    getTransactionById: vi.fn(),
    allocateParty: vi.fn(),
    listParties: vi.fn(),
    isHealthy: vi.fn(),
    ...overrides,
  } as unknown as CantonClient;
}

const PARTY = "Agent::1220abcdef1234567890";

function makeHoldingContract(contractId: string, amount: string) {
  return {
    contractId,
    templateId: USDCX_HOLDING_TEMPLATE_ID,
    createArgument: { owner: PARTY, amount },
    createdAt: "",
    signatories: [PARTY],
    observers: [],
  };
}

// ---------------------------------------------------------------------------
// USDCxService.getHoldings
// ---------------------------------------------------------------------------

describe("USDCxService.getHoldings", () => {
  it("queries active contracts with correct filter and parses holdings", async () => {
    const queryFn = vi.fn().mockResolvedValue([
      makeHoldingContract("cid-1", "5.000000"),
      makeHoldingContract("cid-2", "3.500000"),
    ]);

    const client = mockClient({ queryActiveContracts: queryFn });
    const service = new USDCxService(client, PARTY);

    const holdings = await service.getHoldings();

    expect(holdings).toHaveLength(2);
    expect(holdings[0]).toEqual({
      contractId: "cid-1",
      owner: PARTY,
      amount: "5.000000",
      templateId: USDCX_HOLDING_TEMPLATE_ID,
    });
    expect(holdings[1].amount).toBe("3.500000");

    // Verify the query was made with correct filter
    expect(queryFn).toHaveBeenCalledWith({
      filtersByParty: {
        [PARTY]: {
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
      activeAtOffset: 42,
    });
  });

  it("returns empty array when no holdings", async () => {
    const client = mockClient();
    const service = new USDCxService(client, PARTY);

    const holdings = await service.getHoldings();
    expect(holdings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// USDCxService.getBalance
// ---------------------------------------------------------------------------

describe("USDCxService.getBalance", () => {
  it("sums all holding amounts", async () => {
    const client = mockClient({
      queryActiveContracts: vi.fn().mockResolvedValue([
        makeHoldingContract("cid-1", "5.000000"),
        makeHoldingContract("cid-2", "3.500000"),
        makeHoldingContract("cid-3", "1.500000"),
      ]),
    });

    const service = new USDCxService(client, PARTY);
    const balance = await service.getBalance();

    expect(balance).toBe("10");
  });

  it("returns '0' when no holdings", async () => {
    const client = mockClient();
    const service = new USDCxService(client, PARTY);

    const balance = await service.getBalance();
    expect(balance).toBe("0");
  });

  it("handles single holding", async () => {
    const client = mockClient({
      queryActiveContracts: vi.fn().mockResolvedValue([
        makeHoldingContract("cid-1", "42.123456"),
      ]),
    });

    const service = new USDCxService(client, PARTY);
    const balance = await service.getBalance();

    expect(balance).toBe("42.123456");
  });

  it("handles very small amounts", async () => {
    const client = mockClient({
      queryActiveContracts: vi.fn().mockResolvedValue([
        makeHoldingContract("cid-1", "0.000001"),
        makeHoldingContract("cid-2", "0.000002"),
      ]),
    });

    const service = new USDCxService(client, PARTY);
    const balance = await service.getBalance();

    expect(balance).toBe("0.000003");
  });
});

// ---------------------------------------------------------------------------
// USDCxService.transfer
// ---------------------------------------------------------------------------

describe("USDCxService.transfer", () => {
  it("builds correct ExerciseCommand and submits", async () => {
    const submitFn = vi.fn().mockResolvedValue({ updateId: "upd-tx", completionOffset: 50 });
    const client = mockClient({
      queryActiveContracts: vi.fn().mockResolvedValue([
        makeHoldingContract("cid-100", "10.000000"),
      ]),
      submitAndWait: submitFn,
    });

    const service = new USDCxService(client, PARTY);
    const result = await service.transfer({
      recipient: "Gateway::1220ffff",
      amount: "5.0",
      commandId: "cmd-fixed",
    });

    expect(result.updateId).toBe("upd-tx");
    expect(result.completionOffset).toBe(50);
    expect(result.commandId).toBe("cmd-fixed");

    // Verify the command structure
    const submitCall = submitFn.mock.calls[0][0];
    expect(submitCall.commandId).toBe("cmd-fixed");
    expect(submitCall.actAs).toEqual([PARTY]);
    expect(submitCall.readAs).toEqual([PARTY]);

    const cmd = submitCall.commands[0].ExerciseCommand;
    expect(cmd.templateId).toBe(TRANSFER_FACTORY_TEMPLATE_ID);
    expect(cmd.choice).toBe("TransferFactory_Transfer");
    expect(cmd.choiceArgument.sender).toBe(PARTY);
    expect(cmd.choiceArgument.receiver).toBe("Gateway::1220ffff");
    expect(cmd.choiceArgument.amount).toBe("5.0000000000");
    expect(cmd.choiceArgument.instrumentId).toBe(USDCX_INSTRUMENT_ID);
    expect(cmd.choiceArgument.inputHoldingCids).toEqual(["cid-100"]);
  });

  it("auto-generates commandId when not provided", async () => {
    const submitFn = vi.fn().mockResolvedValue({ updateId: "upd-auto", completionOffset: 1 });
    const client = mockClient({
      queryActiveContracts: vi.fn().mockResolvedValue([
        makeHoldingContract("cid-1", "100"),
      ]),
      submitAndWait: submitFn,
    });

    const service = new USDCxService(client, PARTY);
    const result = await service.transfer({
      recipient: "Bob::1220aaaa",
      amount: "1",
    });

    // commandId should be a UUID
    expect(result.commandId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("throws InsufficientBalanceError when balance is too low", async () => {
    const client = mockClient({
      queryActiveContracts: vi.fn().mockResolvedValue([
        makeHoldingContract("cid-1", "1.000000"),
      ]),
    });

    const service = new USDCxService(client, PARTY);

    await expect(
      service.transfer({ recipient: "Bob::1220", amount: "5.0" }),
    ).rejects.toThrow(InsufficientBalanceError);
  });

  it("selects multiple holdings for merge-then-transfer", async () => {
    const submitFn = vi.fn().mockResolvedValue({ updateId: "upd-merge", completionOffset: 60 });
    const client = mockClient({
      queryActiveContracts: vi.fn().mockResolvedValue([
        makeHoldingContract("cid-a", "3.000000"),
        makeHoldingContract("cid-b", "4.000000"),
      ]),
      submitAndWait: submitFn,
    });

    const service = new USDCxService(client, PARTY);
    const result = await service.transfer({
      recipient: "Charlie::1220cccc",
      amount: "6.0",
      commandId: "cmd-multi",
    });

    expect(result.updateId).toBe("upd-merge");

    // Both holdings should be in inputHoldingCids
    const cmd = submitFn.mock.calls[0][0].commands[0].ExerciseCommand;
    expect(cmd.choiceArgument.inputHoldingCids).toHaveLength(2);
    expect(cmd.choiceArgument.inputHoldingCids).toContain("cid-a");
    expect(cmd.choiceArgument.inputHoldingCids).toContain("cid-b");
  });
});

// ---------------------------------------------------------------------------
// USDCxService.mergeHoldings
// ---------------------------------------------------------------------------

describe("USDCxService.mergeHoldings", () => {
  it("submits merge command with correct structure", async () => {
    const submitFn = vi.fn().mockResolvedValue({ updateId: "upd-merge", completionOffset: 70 });
    const client = mockClient({ submitAndWait: submitFn });

    const service = new USDCxService(client, PARTY);
    const commandId = await service.mergeHoldings(["cid-1", "cid-2", "cid-3"]);

    expect(commandId).toMatch(/^[0-9a-f]{8}-/);

    const call = submitFn.mock.calls[0][0];
    const cmd = call.commands[0].ExerciseCommand;
    expect(cmd.templateId).toBe(USDCX_HOLDING_TEMPLATE_ID);
    expect(cmd.contractId).toBe("cid-1");
    expect(cmd.choice).toBe("Merge");
    expect(cmd.choiceArgument.holdingCids).toEqual(["cid-2", "cid-3"]);
  });

  it("throws if fewer than 2 holdings", async () => {
    const client = mockClient();
    const service = new USDCxService(client, PARTY);

    await expect(service.mergeHoldings(["cid-1"])).rejects.toThrow(
      "Need at least 2 holdings to merge",
    );

    await expect(service.mergeHoldings([])).rejects.toThrow(
      "Need at least 2 holdings to merge",
    );
  });
});

// ---------------------------------------------------------------------------
// selectHoldings (unit tests)
// ---------------------------------------------------------------------------

describe("selectHoldings", () => {
  function h(id: string, amount: string): USDCxHolding {
    return { contractId: id, owner: PARTY, amount, templateId: "t" };
  }

  it("selects single exact match", () => {
    const result = selectHoldings([h("a", "5"), h("b", "10")], "5");
    expect(result.type).toBe("single");
    expect(result.contractIds).toEqual(["a"]);
  });

  it("selects smallest sufficient single holding", () => {
    const result = selectHoldings(
      [h("a", "100"), h("b", "10"), h("c", "7")],
      "5",
    );
    // Should pick "c" (7) — smallest that covers 5
    expect(result.type).toBe("single");
    expect(result.contractIds).toEqual(["c"]);
  });

  it("accumulates multiple when no single is sufficient", () => {
    const result = selectHoldings(
      [h("a", "3"), h("b", "4"), h("c", "2")],
      "8",
    );
    expect(result.type).toBe("merge-then-transfer");
    expect(result.contractIds).toHaveLength(3);
  });

  it("accumulates in descending order (greedy)", () => {
    const result = selectHoldings(
      [h("a", "1"), h("b", "5"), h("c", "3")],
      "7",
    );
    expect(result.type).toBe("merge-then-transfer");
    // descending: b(5), c(3) => 8 >= 7
    expect(result.contractIds).toEqual(["b", "c"]);
  });

  it("throws InsufficientBalanceError when total < required", () => {
    expect(() =>
      selectHoldings([h("a", "1"), h("b", "2")], "10"),
    ).toThrow(InsufficientBalanceError);
  });

  it("throws InsufficientBalanceError for empty holdings", () => {
    expect(() => selectHoldings([], "1")).toThrow(InsufficientBalanceError);
  });

  it("InsufficientBalanceError has available and required fields", () => {
    try {
      selectHoldings([h("a", "2.5"), h("b", "1.5")], "10");
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(InsufficientBalanceError);
      const e = err as InsufficientBalanceError;
      expect(e.available).toBe("4");
      expect(e.required).toBe("10");
    }
  });

  it("handles decimal amounts", () => {
    const result = selectHoldings(
      [h("a", "0.5"), h("b", "0.3"), h("c", "0.4")],
      "0.6",
    );
    // descending: a(0.5), c(0.4) => 0.9 >= 0.6 but a alone is not enough (0.5 < 0.6)
    expect(result.type).toBe("merge-then-transfer");
    expect(result.contractIds).toEqual(["a", "c"]);
  });

  it("prefers single holding over merge", () => {
    const result = selectHoldings(
      [h("a", "5"), h("b", "5"), h("c", "10")],
      "10",
    );
    expect(result.type).toBe("single");
    expect(result.contractIds).toEqual(["c"]);
  });
});
