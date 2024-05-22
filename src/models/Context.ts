import { Pair } from './ApiData';
import { OverviewData } from './OverviewData';

export interface ContextVariables {
  overviewData: OverviewData;
  isDataLoading: boolean;
  riskContext: {
    selectedPair: { base: string; quote: string; };
    morphoData: OverviewData;
    current: boolean;
    pair: Pair;
    LTV: number;
    liquidationBonus: number;
    supplyCapInLoanAsset: number;
    loanAssetPrice: number;
    availablePairs: Pair[];
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
