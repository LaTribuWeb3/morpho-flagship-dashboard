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
    chain: 'eth',
    overviewData: {},
    loading: true,
    availablePairs: {},
    pairsByPlatform: {},
    platformsByPair: {},
    riskParameters: {},
    pages: {
      riskLevels: {
        selectedPair: { base: '', quote: '' },
        currentLiquidationThreshold: 0,
        selectedRiskParameter: {
          pair: { base: '', quote: '' },
          ltv: 0,
          liquidationThreshold: 0,
          bonus: 0,
          visible: true,
          supplyCapInUSD: 0,
          borrowCapInUSD: 0,
          basePrice: 0
        },
        capUSD: 0,
        capInKind: 0,
        tokenPrice: 0
      },
      dataSources: {
        current: false,
        pair: { base: '', quote: '' },
        platform: 'all',
        platformsForPair: [],
        slippage: 500
      }
    }
  },
  setContextVariables: () => {}
};
