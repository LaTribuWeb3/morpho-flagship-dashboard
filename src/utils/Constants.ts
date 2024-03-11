export const DATA_SOURCES = ['All sources', 'Pancakeswap StableSwaps', 'Pancakeswap v2', 'Pancakeswap v3', 'Wombat'];

export const DATA_SOURCES_MAP = {
  'All sources': 'all',
  'Pancakeswap StableSwaps': 'pancake',
  'Pancakeswap v2': 'pancakeswapv2',
  'Pancakeswap v3': 'pancakeswapv3',
  Wombat: 'wombat'
};

export const SLIPPAGES_BPS = Array.from({ length: 20 }).map((_v, i) => (i + 1) * 100);
