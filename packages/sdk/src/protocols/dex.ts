/**
 * DEX protocol adapter interface + MockDexProtocol.
 */

import type { CantonClient } from "../canton/client.js";

export interface SwapQuote {
  from: string;
  to: string;
  inputAmount: string;
  outputAmount: string;
  rate: string;
  priceImpact: string;
  fee: string;
  expiresAt: string;
}

export interface SwapResult {
  txId: string;
  from: string;
  to: string;
  inputAmount: string;
  outputAmount: string;
  rate: string;
  fee: string;
  timestamp: string;
}

export interface TradingPair {
  base: string;
  quote: string;
  liquidity: string;
}

export interface ExchangeRate {
  pair: string;
  rate: string;
  change24h: string;
}

export interface DexProtocol {
  name: string;
  quote(from: string, to: string, amount: string): Promise<SwapQuote>;
  swap(client: CantonClient, partyId: string, from: string, to: string, amount: string, maxSlippage: string): Promise<SwapResult>;
  pairs(): Promise<TradingPair[]>;
  rates(): Promise<ExchangeRate[]>;
}

/** Mock CC price in USDCx. */
const CC_PRICE = "0.015";

/**
 * Mock DEX protocol. Simulates USDCx/CC pair.
 */
export class MockDexProtocol implements DexProtocol {
  readonly name = "mock-dex";

  async quote(from: string, to: string, amount: string): Promise<SwapQuote> {
    const inputNum = parseFloat(amount);
    let rate: number;
    let outputNum: number;

    if (from === "USDCx" && to === "CC") {
      rate = 1 / parseFloat(CC_PRICE);
      outputNum = inputNum * rate;
    } else if (from === "CC" && to === "USDCx") {
      rate = parseFloat(CC_PRICE);
      outputNum = inputNum * rate;
    } else {
      throw new Error(`Unsupported pair: ${from}/${to}`);
    }

    const fee = (inputNum * 0.003).toFixed(6); // 0.3% fee
    const priceImpact = inputNum > 10000 ? "0.5" : inputNum > 1000 ? "0.1" : "0.01";

    return {
      from,
      to,
      inputAmount: amount,
      outputAmount: outputNum.toFixed(6),
      rate: rate.toFixed(6),
      priceImpact,
      fee,
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
    };
  }

  async swap(
    _client: CantonClient,
    _partyId: string,
    from: string,
    to: string,
    amount: string,
    maxSlippage: string,
  ): Promise<SwapResult> {
    const q = await this.quote(from, to, amount);

    if (parseFloat(q.priceImpact) > parseFloat(maxSlippage)) {
      throw new Error(`Price impact ${q.priceImpact}% exceeds max slippage ${maxSlippage}%`);
    }

    return {
      txId: `swap-${Date.now()}`,
      from,
      to,
      inputAmount: amount,
      outputAmount: q.outputAmount,
      rate: q.rate,
      fee: q.fee,
      timestamp: new Date().toISOString(),
    };
  }

  async pairs(): Promise<TradingPair[]> {
    return [
      { base: "CC", quote: "USDCx", liquidity: "1000000" },
    ];
  }

  async rates(): Promise<ExchangeRate[]> {
    return [
      { pair: "CC/USDCx", rate: CC_PRICE, change24h: "+2.5" },
    ];
  }
}
