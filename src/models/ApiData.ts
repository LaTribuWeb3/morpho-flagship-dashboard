export interface Pair {
  base: string;
  quote: string;
}

export interface LiquidityData {
  updated: number; // timestamp ms
  liquidity: { [blockNumber: string]: DataAtBlock };
}

export interface DataAtBlock {
  priceMin: number;
  priceMax: number;
  priceMedian: number;
  avgSlippageMap: { [slippageBps: number]: { base: number; quote: number } };
  volatility: number;
}
