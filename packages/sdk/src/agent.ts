/**
 * CantonAgent — high-level entry point for the Canton SDK.
 *
 * Creates and wires together all sub-services:
 * - CheckingAccount (USDCx balance, send, history)
 * - SafeguardManager (tx limits, daily limits, lock)
 * - TrafficManager (validator traffic budgets)
 * - MppPayClient (HTTP 402 auto-pay)
 */

import { CheckingAccount } from "./accounts/checking.js";
import { CantonClient } from "./canton/client.js";
import { USDCxService } from "./canton/usdcx.js";
import { MppPayClient } from "./mpp/pay-client.js";
import { SafeguardManager } from "./safeguards/manager.js";
import { TrafficManager } from "./traffic/manager.js";
import {
  loadConfig,
  type AgentConfig,
} from "./wallet/config.js";

export interface WalletInfo {
  address: string;
  partyId: string;
  network: string;
}

export interface CantonAgentConfig {
  ledgerUrl?: string;
  token?: string;
  userId?: string;
  partyId?: string;
  network?: "mainnet" | "testnet" | "devnet";
  configPath?: string;
  safeguardsPath?: string;
}

export class CantonAgent {
  readonly checking: CheckingAccount;
  readonly safeguards: SafeguardManager;
  readonly traffic: TrafficManager;
  readonly mpp: MppPayClient;
  readonly wallet: WalletInfo;

  private readonly client: CantonClient;
  private readonly usdcx: USDCxService;

  private constructor(
    client: CantonClient,
    usdcx: USDCxService,
    checking: CheckingAccount,
    safeguards: SafeguardManager,
    traffic: TrafficManager,
    mpp: MppPayClient,
    wallet: WalletInfo,
  ) {
    this.client = client;
    this.usdcx = usdcx;
    this.checking = checking;
    this.safeguards = safeguards;
    this.traffic = traffic;
    this.mpp = mpp;
    this.wallet = wallet;
  }

  /**
   * Create a new CantonAgent from config.
   *
   * Loads configuration from ~/.caypo/config.json (or overrides),
   * initializes all sub-services, and wires them together.
   */
  static async create(config?: CantonAgentConfig): Promise<CantonAgent> {
    // 1. Load config (file + overrides)
    const fileConfig = await loadConfig(config?.configPath);
    const merged: AgentConfig = {
      ...fileConfig,
      ...(config?.ledgerUrl && { ledgerUrl: config.ledgerUrl }),
      ...(config?.partyId && { partyId: config.partyId }),
      ...(config?.userId && { userId: config.userId }),
      ...(config?.network && { network: config.network }),
    };

    const token = config?.token ?? "";

    // 2. Create low-level client
    const client = new CantonClient({
      ledgerUrl: merged.ledgerUrl,
      token,
      userId: merged.userId,
    });

    // 3. Create services
    const usdcx = new USDCxService(client, merged.partyId);
    const safeguards = await SafeguardManager.load(config?.safeguardsPath);
    const traffic = new TrafficManager(client, merged.partyId);
    const checking = new CheckingAccount(usdcx, safeguards, client, merged.partyId);
    const mpp = new MppPayClient(usdcx, safeguards, merged.partyId, merged.network);

    const wallet: WalletInfo = {
      address: merged.partyId,
      partyId: merged.partyId,
      network: merged.network,
    };

    return new CantonAgent(client, usdcx, checking, safeguards, traffic, mpp, wallet);
  }

  /**
   * Create a CantonAgent from explicit parameters (no file I/O).
   * Useful for testing and programmatic setup.
   */
  static fromParams(params: {
    client: CantonClient;
    partyId: string;
    network: string;
    safeguards?: SafeguardManager;
  }): CantonAgent {
    const safeguards = params.safeguards ?? new SafeguardManager();
    const usdcx = new USDCxService(params.client, params.partyId);
    const traffic = new TrafficManager(params.client, params.partyId);
    const checking = new CheckingAccount(usdcx, safeguards, params.client, params.partyId);
    const mpp = new MppPayClient(usdcx, safeguards, params.partyId, params.network);

    const wallet: WalletInfo = {
      address: params.partyId,
      partyId: params.partyId,
      network: params.network,
    };

    return new CantonAgent(params.client, usdcx, checking, safeguards, traffic, mpp, wallet);
  }
}
