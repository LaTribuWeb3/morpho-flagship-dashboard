export const DATA_SOURCES = ['All sources', 'Uniswap v2', 'Uniswap v3', 'Curve', 'Sushiswap v2', 'Balancer'];

export const DATA_SOURCES_MAP = {
  'All sources': 'all',
  'Uniswap v2': 'uniswapv2',
  'Uniswap v3': 'uniswapv3',
  Curve: 'curve',
  'Sushiswap v2': 'sushiswapv2',
  Balancer: 'balancer'
};

export const SLIPPAGES_BPS = Array.from({ length: 20 }).map((_v, i) => (i + 1) * 100);

export const MORPHO_RISK_PARAMETERS_ARRAY = [
  {
    ltv: 0.98,
    bonus: 50
  },
  {
    ltv: 0.965,
    bonus: 100
  },
  {
    ltv: 0.945,
    bonus: 150
  },

  {
    ltv: 0.915,
    bonus: 250
  },
  {
    ltv: 0.86,
    bonus: 400
  },
  {
    ltv: 0.77,
    bonus: 700
  },
  {
    ltv: 0.625,
    bonus: 1250
  }
];

import { appContextType } from '../models/AppContext';

export const initialContext: appContextType = {
  contextVariables: {
    availablePairs: [],
    chain: "eth",
    data: {
      updated: 0,
      liquidity: {}
    },
    datasourcesContext: {
      current: true,
      pair: {
        base: "",
        quote: ""
      },
      datasource: "",
      slippage: 0
    },
    isDataLoading: false,
    loading: true,
    overviewData: {},
    morphoRiskParameters: {
      ltv: 0,
      bonus: 0
    },
    pages: {
      dataSources: {
        current: false,
        pair: {
          base: "",
          quote: ""
        },
        platform: "all",
        platformsForPair: [],
        slippage: 500
      },
      riskLevels: {
        baseTokenPrice: 0,
        capInKind: 0,
        capUSD: 0,
        currentLiquidationThreshold: 0,
        selectedPair: {
          base: "",
          quote: ""
        },
        selectedRiskParameter: {
          basePrice: 0,
          bonus: 0,
          borrowCapInUSD: 0,
          liquidationThreshold: 0,
          ltv: 0,
          pair: {
            base: "",
            quote: ""
          },
          supplyCapInUSD: 0,
          visible: true
        },
        selectedLTV: "",
        selectedBonus: 0,
        tokenPrice: 0
      }
    },
    pairsByPlatform: {},
    platformsByPair: {},
    riskContext: {
      current: true,
      pair: { base: "", quote: "" },
      LTV: 0,
      liquidationBonus: 0,
      supplyCapInLoanAsset: 0,
      loanAssetPrice: 0
    },
    riskParameters: {}
  },
  setContextVariables: () => { }
};
