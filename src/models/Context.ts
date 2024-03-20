import { Pair } from './ApiData';

export interface ContextVariables {
  riskContext: {
    current: boolean;
    pair: Pair;
    LTV: number;
    liquidationBonus: number;
    supplyCapInLoanAsset: number;
    loanAssetPrice: number;
  };
  datasourcesContext: {
    current: boolean;
    pair: Pair;
    datasource: string;
    slippage: number;
  };
}
export interface AppContextType {
  contextVariables: ContextVariables;
  setContextVariables: React.Dispatch<React.SetStateAction<ContextVariables>>;
}
