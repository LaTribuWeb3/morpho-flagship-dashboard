import { Pair } from './ApiData';
import { OverviewData } from './OverviewData';
import { MorphoRiskParameter, MorphoRiskParameters } from './RiskData';

export interface AppContextProperties {
  chain: string;
  overviewData: OverviewData;
  loading: boolean;
  availablePairs: {
    [key: string]: Pair[];
  };
  pairsByPlatform: {
    [key: string]: Pair[];
  };
  platformsByPair: {
    [key: string]: string[];
  };
  riskParameters: MorphoRiskParameters;
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
}

export interface appContextType {
  contextVariables: AppContextProperties;
  setContextVariables: React.Dispatch<React.SetStateAction<AppContextProperties>>;
}
