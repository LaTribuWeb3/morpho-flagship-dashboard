export interface OverviewData {
  [symbol: string]: RiskLevelData;
}

export interface RiskLevelData {
  riskLevel: number;
  subMarkets: SubMarket[];
}

export interface SubMarket {
  quote: string;
  riskLevel: number;
  LTV: number;
  liquidationBonus: number;
  supplyCapUsd: number;
  supplyCapInKind: number;
  borrowCapUsd: number;
  borrowCapInKind: number;
  volatility: number;
  liquidity: number;
  basePrice: number;
  quotePrice: number;
}
