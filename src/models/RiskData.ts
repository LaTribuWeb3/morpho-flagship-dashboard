import { Pair } from './ApiData';

export interface MorphoRiskParameters {
  [symbol: string]: {
    [quote: string]: MorphoRiskParameter;
  };
}

export interface MorphoRiskParameter {
  pair: Pair;
  ltv: number;
  bonus: number;
  visible: true;
  supplyCapInUSD: number;
  borrowCapInUSD: number;
  basePrice: number;
  liquidationThreshold: number;
}
