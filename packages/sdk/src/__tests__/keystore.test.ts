import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Keystore } from "../wallet/keystore.js";

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let tmpDir: string;
let walletPath: string;

const PIN = "1234";
const PARTY = "Agent::1220abcdef1234567890";
const JWT = "eyJhbGciOiJSUzI1NiJ9.test-jwt-payload";
const USER_ID = "ledger-api-user";

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "caypo-keystore-test-"));
  walletPath = join(tmpDir, "wallet.key");
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Keystore.create
// ---------------------------------------------------------------------------

describe("Keystore.create", () => {
  it("creates a new wallet and returns a Keystore instance", async () => {
    const ks = await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );

    expect(ks.address).toBe(PARTY);
  });

  it("getCredentials returns partyId, jwt, userId", async () => {
    const ks = await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );

    const creds = ks.getCredentials();
    expect(creds.partyId).toBe(PARTY);
    expect(creds.jwt).toBe(JWT);
    expect(creds.userId).toBe(USER_ID);
  });

  it("creates parent directories if they don't exist", async () => {
    const nested = join(tmpDir, "deep", "nested", "wallet.key");
    const ks = await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      nested,
    );

    expect(ks.address).toBe(PARTY);

    // Verify it can be loaded back
    const loaded = await Keystore.load(PIN, nested);
    expect(loaded.address).toBe(PARTY);
  });
});

// ---------------------------------------------------------------------------
// Keystore.load
// ---------------------------------------------------------------------------

describe("Keystore.load", () => {
  it("loads and decrypts an existing wallet with correct PIN", async () => {
    await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );

    const loaded = await Keystore.load(PIN, walletPath);

    expect(loaded.address).toBe(PARTY);
    const creds = loaded.getCredentials();
    expect(creds.partyId).toBe(PARTY);
    expect(creds.jwt).toBe(JWT);
    expect(creds.userId).toBe(USER_ID);
  });

  it("throws with wrong PIN", async () => {
    await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );

    await expect(Keystore.load("wrong-pin", walletPath)).rejects.toThrow(
      "Invalid PIN or corrupted wallet file",
    );
  });

  it("throws if file does not exist", async () => {
    await expect(Keystore.load(PIN, join(tmpDir, "nonexistent.key"))).rejects.toThrow();
  });

  it("different PINs produce different encryptions", async () => {
    const path1 = join(tmpDir, "w1.key");
    const path2 = join(tmpDir, "w2.key");

    await Keystore.create(PIN, { partyId: PARTY, jwt: JWT, userId: USER_ID }, path1);
    await Keystore.create("5678", { partyId: PARTY, jwt: JWT, userId: USER_ID }, path2);

    // Files should have different content (different salt, IV)
    const { readFile } = await import("node:fs/promises");
    const f1 = await readFile(path1, "utf8");
    const f2 = await readFile(path2, "utf8");
    expect(f1).not.toBe(f2);

    // But both should load correctly with their own PINs
    const ks1 = await Keystore.load(PIN, path1);
    const ks2 = await Keystore.load("5678", path2);
    expect(ks1.address).toBe(PARTY);
    expect(ks2.address).toBe(PARTY);
  });
});

// ---------------------------------------------------------------------------
// Keystore.changePin
// ---------------------------------------------------------------------------

describe("Keystore.changePin", () => {
  it("re-encrypts with new PIN, old PIN no longer works", async () => {
    const ks = await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );

    await ks.changePin(PIN, "9999");

    // New PIN works
    const loaded = await Keystore.load("9999", walletPath);
    expect(loaded.address).toBe(PARTY);
    expect(loaded.getCredentials().jwt).toBe(JWT);

    // Old PIN fails
    await expect(Keystore.load(PIN, walletPath)).rejects.toThrow(
      "Invalid PIN or corrupted wallet file",
    );
  });

  it("throws if old PIN is wrong", async () => {
    const ks = await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );

    await expect(ks.changePin("wrong", "9999")).rejects.toThrow(
      "Invalid PIN or corrupted wallet file",
    );
  });
});

// ---------------------------------------------------------------------------
// Keystore.exportKey
// ---------------------------------------------------------------------------

describe("Keystore.exportKey", () => {
  it("returns a 64-character hex string (32 bytes)", async () => {
    const ks = await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );

    const key = ks.exportKey(PIN);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns consistent key across load cycles", async () => {
    const ks = await Keystore.create(
      PIN,
      { partyId: PARTY, jwt: JWT, userId: USER_ID },
      walletPath,
    );
    const key1 = ks.exportKey(PIN);

    const loaded = await Keystore.load(PIN, walletPath);
    const key2 = loaded.exportKey(PIN);

    expect(key1).toBe(key2);
  });
});
