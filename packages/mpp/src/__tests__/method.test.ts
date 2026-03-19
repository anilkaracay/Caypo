import { describe, expect, it } from "vitest";
import { cantonMethod } from "../method.js";
import { credentialPayloadSchema, requestSchema } from "../schemas.js";

// ---------------------------------------------------------------------------
// cantonMethod definition
// ---------------------------------------------------------------------------

describe("cantonMethod", () => {
  it("has correct name and intent", () => {
    expect(cantonMethod.name).toBe("canton");
    expect(cantonMethod.intent).toBe("charge");
  });

  it("has request and credential schemas", () => {
    expect(cantonMethod.schema.request).toBeDefined();
    expect(cantonMethod.schema.credential.payload).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// requestSchema validation
// ---------------------------------------------------------------------------

describe("requestSchema", () => {
  const valid = {
    amount: "1.50",
    currency: "USDCx" as const,
    recipient: "Gateway::1220abcd",
    network: "mainnet" as const,
  };

  it("accepts valid request with defaults", () => {
    const result = requestSchema.parse(valid);
    expect(result.amount).toBe("1.50");
    expect(result.currency).toBe("USDCx");
    expect(result.expiry).toBe(300); // default
    expect(result.description).toBeUndefined();
  });

  it("accepts request with all fields", () => {
    const result = requestSchema.parse({
      ...valid,
      description: "API call payment",
      expiry: 60,
    });
    expect(result.description).toBe("API call payment");
    expect(result.expiry).toBe(60);
  });

  it("accepts CC currency", () => {
    const result = requestSchema.parse({ ...valid, currency: "CC" });
    expect(result.currency).toBe("CC");
  });

  it("accepts all network types", () => {
    for (const network of ["mainnet", "testnet", "devnet"] as const) {
      const result = requestSchema.parse({ ...valid, network });
      expect(result.network).toBe(network);
    }
  });

  it("accepts amount with up to 10 decimals", () => {
    expect(() => requestSchema.parse({ ...valid, amount: "0.0000000001" })).not.toThrow();
    expect(() => requestSchema.parse({ ...valid, amount: "999999" })).not.toThrow();
    expect(() => requestSchema.parse({ ...valid, amount: "0" })).not.toThrow();
  });

  it("rejects invalid amount format", () => {
    expect(() => requestSchema.parse({ ...valid, amount: "" })).toThrow();
    expect(() => requestSchema.parse({ ...valid, amount: "-1" })).toThrow();
    expect(() => requestSchema.parse({ ...valid, amount: "abc" })).toThrow();
    expect(() => requestSchema.parse({ ...valid, amount: ".5" })).toThrow();
    expect(() => requestSchema.parse({ ...valid, amount: "1.00000000001" })).toThrow(); // 11 decimals
  });

  it("rejects invalid currency", () => {
    expect(() => requestSchema.parse({ ...valid, currency: "ETH" })).toThrow();
  });

  it("rejects invalid network", () => {
    expect(() => requestSchema.parse({ ...valid, network: "ethereum" })).toThrow();
  });

  it("rejects empty recipient", () => {
    expect(() => requestSchema.parse({ ...valid, recipient: "" })).toThrow();
  });

  it("rejects expiry out of range", () => {
    expect(() => requestSchema.parse({ ...valid, expiry: 0 })).toThrow();
    expect(() => requestSchema.parse({ ...valid, expiry: 3601 })).toThrow();
    expect(() => requestSchema.parse({ ...valid, expiry: -1 })).toThrow();
  });

  it("rejects expiry with non-integer", () => {
    expect(() => requestSchema.parse({ ...valid, expiry: 1.5 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// credentialPayloadSchema validation
// ---------------------------------------------------------------------------

describe("credentialPayloadSchema", () => {
  const valid = {
    updateId: "update-123",
    completionOffset: 42,
    sender: "Agent::1220abcd",
    commandId: "cmd-456",
  };

  it("accepts valid payload", () => {
    const result = credentialPayloadSchema.parse(valid);
    expect(result.updateId).toBe("update-123");
    expect(result.completionOffset).toBe(42);
    expect(result.sender).toBe("Agent::1220abcd");
    expect(result.commandId).toBe("cmd-456");
  });

  it("rejects empty updateId", () => {
    expect(() => credentialPayloadSchema.parse({ ...valid, updateId: "" })).toThrow();
  });

  it("rejects empty sender", () => {
    expect(() => credentialPayloadSchema.parse({ ...valid, sender: "" })).toThrow();
  });

  it("rejects empty commandId", () => {
    expect(() => credentialPayloadSchema.parse({ ...valid, commandId: "" })).toThrow();
  });

  it("rejects non-integer completionOffset", () => {
    expect(() => credentialPayloadSchema.parse({ ...valid, completionOffset: 1.5 })).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => credentialPayloadSchema.parse({})).toThrow();
    expect(() => credentialPayloadSchema.parse({ updateId: "x" })).toThrow();
  });
});
