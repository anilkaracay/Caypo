/**
 * ExchangeAccount — swap between USDCx and CC (Canton Coin).
 * Uses DEX adapter pattern for pluggable exchange integrations.
 */

import type { CantonClient } from "../canton/client.js";
import type {
  DexProtocol,
  SwapQuote,
  SwapResult,
  TradingPair,
  ExchangeRate,
} from "../protocols/dex.js";

const DEFAULT_MAX_SLIPPAGE = "1.0"; // 1%

export interface SwapOptions {
  maxSlippage?: string;
}

export class ExchangeAccount {
  constructor(
    private readonly dex: DexProtocol,
    private readonly client: CantonClient,
    private readonly partyId: string,
  ) {}

  /** Get a quote for swapping from one token to another. */
  async quote(amount: string, from: string, to: string): Promise<SwapQuote> {
    return this.dex.quote(from, to, amount);
  }

  /** Execute a swap with slippage protection. */
  async swap(amount: string, from: string, to: string, opts?: SwapOptions): Promise<SwapResult> {
    const maxSlippage = opts?.maxSlippage ?? DEFAULT_MAX_SLIPPAGE;
    return this.dex.swap(this.client, this.partyId, from, to, amount, maxSlippage);
  }

  /** Get available trading pairs. */
  async pairs(): Promise<TradingPair[]> {
    return this.dex.pairs();
  }

  /** Get current exchange rates. */
  async rates(): Promise<ExchangeRate[]> {
    return this.dex.rates();
  }
}
