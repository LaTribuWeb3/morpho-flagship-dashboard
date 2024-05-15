import { LiquidityData, Pair } from './ApiData';
import { OverviewData } from './OverviewData';
import { MorphoRiskParameter, MorphoRiskParameters } from './RiskData';

export interface AppContextProperties {
  availablePairs: Pair[];

  chain: string;

  data: LiquidityData;

  datasourcesContext: {
    current: boolean;
    pair: Pair;
    datasource: string;
    slippage: number;
  };
  
  isDataLoading: boolean;

  loading: boolean;

  morphoRiskParameters: {
    ltv: number;
    bonus: number;
  };

  overviewData: OverviewData;

  pages: {
    riskLevels: {
      currentLiquidationThreshold: number;
      selectedPair: Pair;
      selectedRiskParameter: MorphoRiskParameter;
      capUSD: number;
      capInKind: number;
      tokenPrice: number;
    };
    dataSources: {
      current: boolean;
      pair: Pair;
      platform: string;
      platformsForPair: string[];
      slippage: number;
    };
  };

  pairsByPlatform: {
    [key: string]: Pair[];
  };

  platformsByPair: {
    [key: string]: string[];
  };

  riskContext: {
    current: boolean;
    pair: {
      base: string;
      quote: string;
    };
    LTV: number;
    liquidationBonus: number;
    supplyCapInLoanAsset: number;
    loanAssetPrice: number;
  };

  riskParameters: MorphoRiskParameters;
}

export interface appContextType {
  contextVariables: AppContextProperties;

  setContextVariables: React.Dispatch<React.SetStateAction<AppContextProperties>>;
}
