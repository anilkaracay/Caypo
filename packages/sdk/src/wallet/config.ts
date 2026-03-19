/**
 * Agent configuration — load/save ~/.caypo/config.json
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_CONFIG_PATH = join(homedir(), ".caypo", "config.json");

export interface TrafficConfig {
  autoPurchase: boolean;
  minBalance: number;
  purchaseAmountCC: string;
}

export interface SafeguardsConfig {
  txLimit: string;
  dailyLimit: string;
}

export interface MppConfig {
  gatewayUrl: string;
  maxAutoPayPrice: string;
}

export interface AgentConfig {
  version: number;
  network: "mainnet" | "testnet" | "devnet";
  ledgerUrl: string;
  partyId: string;
  userId: string;
  keystorePath: string;
  traffic: TrafficConfig;
  safeguards: SafeguardsConfig;
  mpp: MppConfig;
}

export const DEFAULT_CONFIG: AgentConfig = {
  version: 2,
  network: "testnet",
  ledgerUrl: "http://localhost:7575",
  partyId: "",
  userId: "ledger-api-user",
  keystorePath: join(homedir(), ".caypo", "wallet.key"),
  traffic: {
    autoPurchase: true,
    minBalance: 1000,
    purchaseAmountCC: "5.0",
  },
  safeguards: {
    txLimit: "100",
    dailyLimit: "1000",
  },
  mpp: {
    gatewayUrl: "https://mpp.caypo.xyz",
    maxAutoPayPrice: "1.00",
  },
};

/**
 * Load agent configuration from disk.
 * Returns DEFAULT_CONFIG merged with file contents.
 */
export async function loadConfig(path?: string): Promise<AgentConfig> {
  const filePath = path ?? DEFAULT_CONFIG_PATH;

  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AgentConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_CONFIG };
    }
    throw err;
  }
}

/**
 * Save agent configuration to disk.
 * Creates parent directory if it doesn't exist.
 */
export async function saveConfig(config: AgentConfig, path?: string): Promise<void> {
  const filePath = path ?? DEFAULT_CONFIG_PATH;
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(config, null, 2), "utf8");
}
