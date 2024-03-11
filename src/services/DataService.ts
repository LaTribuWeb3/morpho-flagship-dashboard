import axios, { AxiosResponse } from 'axios';
import { LiquidityData, Pair } from '../models/ApiData';
import { LastUpdateData } from '../models/LastUpdateData';
import SimpleCacheService from './CacheService';
import { OverviewData } from '../models/OverviewData';

const apiUrl: string = import.meta.env.VITE_API_URL as string;
export default class DataService {
  static async GetLastUpdate(): Promise<LastUpdateData[]> {
    const lastUpdateData = await SimpleCacheService.GetAndCache(
      'GetLastUpdate',
      async () => {
        // await sleep(500); // add sleep to simulate waiting
        const fullUrl = apiUrl + `/api/dashboard/overview`;
        try {
          const response: AxiosResponse<LastUpdateData[]> = await axios.get(fullUrl);
          console.log(`found ${response.data.length} last update data`);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error('error message: ', error.message);
            throw new Error(`Error fetching data on ${fullUrl}: ${error.message}`);
          } else {
            console.error('unexpected error: ', error);
            throw new Error(`Error fetching data on ${fullUrl}`);
          }
        }
      },
      600 * 1000
    );

    // throw new Error('Could not reach data');
    return lastUpdateData;
  }

  static async GetOverview(): Promise<OverviewData> {
    const overviewData = await SimpleCacheService.GetAndCache(
      'GetOverview',
      async () => {
        // await sleep(500); // add sleep to simulate waiting
        const fullUrl = apiUrl + `/api/dashboard/kinza-overview`;
        try {
          const response: AxiosResponse<OverviewData> = await axios.get(fullUrl);
          console.log(`found ${Object.keys(response.data).length} overview data`);
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error('error message: ', error.message);
            throw new Error(`Error fetching data on ${fullUrl}: ${error.message}`);
          } else {
            console.error('unexpected error: ', error);
            throw new Error(`Error fetching data on ${fullUrl}`);
          }
        }
      },
      600 * 1000
    );

    // throw new Error('Could not reach data');
    return overviewData;
  }

  static async GetAvailablePairs(platform: string): Promise<Pair[]> {
    console.log(`getting available pairs for ${platform}`);
    const pairLoadingFunction = async () => {
      // await sleep(500); // add sleep to simulate waiting
      const fullUrl = apiUrl + `/api/dashboard/available/${platform}`;
      try {
        const response: AxiosResponse<Pair[]> = await axios.get(fullUrl);
        console.log(`found ${response.data.length} available pairs`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('error message: ', error.message);
          throw new Error(`Error fetching data on ${fullUrl}: ${error.message}`);
        } else {
          console.error('unexpected error: ', error);
          throw new Error(`Error fetching data on ${fullUrl}`);
        }
      }
    };

    const availablePairs = await SimpleCacheService.GetAndCache(
      `GetAvailablePairs-${platform}`,
      pairLoadingFunction,
      600 * 1000
    );

    return availablePairs;
  }

  static async GetLiquidityData(platform: string, base: string, quote: string): Promise<LiquidityData> {
    console.log(`getting liquidity data for for ${platform} ${base} ${quote}`);

    const liquidityDataLoadingFunction = async () => {
      // await sleep(1000); // add sleep to simulate waiting
      const fullUrl = apiUrl + `/api/dashboard/${platform}/${base}/${quote}`;
      try {
        const response: AxiosResponse<LiquidityData> = await axios.get(fullUrl);
        console.log(
          `found ${Object.keys(response.data).length} block data for pair ${base} ${quote} on platform ${platform}`
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('error message: ', error.message);
          throw new Error(`Error fetching data on ${fullUrl}: ${error.message}`);
        } else {
          console.error('unexpected error: ', error);
          throw new Error(`Error fetching data on ${fullUrl}`);
        }
      }
    };

    const liquidityData = await SimpleCacheService.GetAndCache(
      `GetLiquidityData-${platform}-${base}-${quote}`,
      liquidityDataLoadingFunction,
      600 * 1000
    );

    return liquidityData;
  }
}
