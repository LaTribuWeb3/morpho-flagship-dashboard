export interface OverviewData {
  [symbol: string]: RiskLevelData;
}

export interface RiskLevelData {
  riskLevel: number;
  name: string;
  loanAssetPrice: number;
  subMarkets: SubMarket[];
}

export interface SubMarket {
  liquidityInKind: number;
  base: string;
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
}
