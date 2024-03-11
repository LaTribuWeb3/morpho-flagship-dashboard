export interface LastUpdateData {
  dataSourceName: string;
  lastBlockFetched: number;
  lastRunTimestampMs: number;
  poolsFetched: PoolData[];
}

export interface PoolData {
  tokens: string[];
  address: string;
  label: string;
}
