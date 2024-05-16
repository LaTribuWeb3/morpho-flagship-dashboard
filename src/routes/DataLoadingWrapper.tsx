import { Box, Skeleton } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { sleep } from '../utils/Utils';
import { Overview } from './overview/Overview';
import { AppContext } from './App';
import { MORPHO_RISK_PARAMETERS_ARRAY, initialContext } from '../utils/Constants';
import DataService from '../services/DataService';
import { OverviewData, RiskLevelData } from '../models/OverviewData';

export default function DataLoadingWrapper() {
  const pathName = useLocation().pathname;
  const { contextVariables, setContextVariables } = useContext(AppContext);

  const navPair = pathName.split('/')[2]
    ? { base: pathName.split('/')[2].split('-')[0], quote: pathName.split('/')[2].split('-')[1] }
    : undefined;
  const navLTV = pathName.split('/')[3] ? pathName.split('/')[3] : undefined;
  const navSupplyCap = pathName.split('/')[4] ? Number(pathName.split('/')[4]) : undefined;
  const navBasePrice = pathName.split('/')[5] ? Number(pathName.split('/')[5]) : undefined;

  useEffect(() => {
    async function fetchData() {
      try {
        contextVariables.isDataLoading = true;

        initialContext.contextVariables.overviewData = await computeSortedOverviewData();
        initialContext.contextVariables.morphoRiskParameters = MORPHO_RISK_PARAMETERS_ARRAY[1];
        initialContext.contextVariables.pages.riskLevels.availablePairs = await DataService.GetAvailablePairs('all');

        initialContext.contextVariables.pages.riskLevels.selectedLTV = MORPHO_RISK_PARAMETERS_ARRAY[1].ltv.toString();
        initialContext.contextVariables.pages.riskLevels.selectedBonus = MORPHO_RISK_PARAMETERS_ARRAY[1].bonus;

        const morphoPairs: string[] = [];
        for (const market in contextVariables.overviewData) {
          contextVariables.overviewData[market].subMarkets.forEach((subMarket) => {
            morphoPairs.push(`${subMarket.base}/${market}`);
          });
        }
        const filteredPairs = contextVariables.pages.riskLevels.availablePairs.filter(({ base, quote }) => morphoPairs.includes(`${base}/${quote}`));

        contextVariables.pages.riskLevels.availablePairs = filteredPairs.sort((a, b) => a.base.localeCompare(b.base));

        if (navPair && contextVariables.pages.riskLevels.availablePairs.some(({ base, quote }) => base === navPair.base && quote === navPair.quote)) {
          contextVariables.pages.riskLevels.selectedPair = navPair;
          if (navLTV) {
            contextVariables.pages.riskLevels.selectedLTV = navLTV;
            const foundParam = MORPHO_RISK_PARAMETERS_ARRAY.find((param) => param.ltv.toString() === navLTV);
            if (foundParam) {
              contextVariables.pages.riskLevels.selectedBonus = foundParam.bonus;
              contextVariables.morphoRiskParameters = foundParam;
              if (navSupplyCap && navBasePrice) {
                contextVariables.pages.riskLevels.capInKind = navSupplyCap;
                contextVariables.pages.riskLevels.capUSD = (navSupplyCap * navBasePrice).toFixed(0) as unknown as number;
                contextVariables.riskContext = {
                  current: true,
                  pair: navPair,
                  LTV: foundParam.ltv,
                  liquidationBonus: foundParam.bonus,
                  supplyCapInLoanAsset: navSupplyCap,
                  loanAssetPrice: navBasePrice
                }
                contextVariables.pages.riskLevels.tokenPrice = navBasePrice;
              }
              const morphoMarketForContext = contextVariables.overviewData[navPair.quote].subMarkets.find(
                (_) => _.LTV == foundParam.ltv && _.base == navPair.base
              );
              if (morphoMarketForContext)
                contextVariables.pages.riskLevels.baseTokenPrice = morphoMarketForContext.basePrice;
            }
          }
        } else if (
          contextVariables.riskContext &&
          contextVariables.riskContext.current &&
          filteredPairs.some(
            ({ base, quote }) =>
              base === contextVariables.riskContext.pair.base && quote === contextVariables.riskContext.pair.quote
          )
        ) {
          contextVariables.pages.riskLevels.selectedPair = contextVariables.riskContext.pair;
          contextVariables.pages.riskLevels.selectedLTV = contextVariables.riskContext.LTV.toString();
          contextVariables.pages.riskLevels.selectedBonus = contextVariables.riskContext.liquidationBonus;
          contextVariables.morphoRiskParameters = {
            ltv: contextVariables.riskContext.LTV,
            bonus: contextVariables.riskContext.liquidationBonus
          };
          contextVariables.pages.riskLevels.capUSD =
            contextVariables.riskContext.supplyCapInLoanAsset * contextVariables.riskContext.loanAssetPrice;
          contextVariables.pages.riskLevels.capInKind = contextVariables.riskContext.supplyCapInLoanAsset;
          contextVariables.pages.riskLevels.tokenPrice = contextVariables.riskContext.loanAssetPrice;
          let morphoMarketForContext = contextVariables.overviewData[contextVariables.riskContext.pair.quote].subMarkets.find(
            (_) => _.LTV == contextVariables.riskContext.LTV && _.base == contextVariables.riskContext.pair.base
          );

          if (morphoMarketForContext) {
            contextVariables.pages.riskLevels.baseTokenPrice = morphoMarketForContext.basePrice;
          } else {
            morphoMarketForContext = contextVariables.overviewData[contextVariables.riskContext.pair.quote].subMarkets.find(
              (_) => _.base == contextVariables.riskContext.pair.base
            );
            if (morphoMarketForContext)
              contextVariables.pages.riskLevels.baseTokenPrice = morphoMarketForContext.basePrice;
          }
        } else if (filteredPairs.length > 0) {
          const firstMarketKey = Object.keys(contextVariables.overviewData)[0];
          const firstMarket = contextVariables.overviewData[firstMarketKey];
          const firstSubMarket = firstMarket.subMarkets[0];
          const pairToSet = { base: firstSubMarket.base, quote: firstMarketKey };
          contextVariables.pages.riskLevels.selectedPair = pairToSet;
          contextVariables.pages.riskLevels.selectedLTV = firstSubMarket.LTV.toString();
          contextVariables.pages.riskLevels.selectedBonus = firstSubMarket.liquidationBonus * 10000;
          contextVariables.morphoRiskParameters = { ltv: firstSubMarket.LTV, bonus: firstSubMarket.liquidationBonus * 10000 };
          contextVariables.pages.riskLevels.capUSD = firstSubMarket.supplyCapUsd;
          contextVariables.pages.riskLevels.capInKind = firstSubMarket.supplyCapInKind;
          contextVariables.pages.riskLevels.tokenPrice = contextVariables.overviewData[firstMarketKey].loanAssetPrice;
          if (firstSubMarket)
            contextVariables.pages.riskLevels.baseTokenPrice = firstSubMarket.basePrice;
        }

        setContextVariables(initialContext.contextVariables);
        await sleep(1); // without this sleep, update the graph before changing the selected pair. so let it here
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error instanceof Error) {
          console.log('Error fetching data:', error.toString());
        } else {
          console.log('Unknown error');
        }
      }
    }
    contextVariables.isDataLoading = true;
    fetchData()
      .then(() => {
        contextVariables.isDataLoading = false
      })
      .catch(console.error);
  }, []);

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        width: '100vw',
        overflow: 'auto',
        direction: 'row'
      }}
    >
      {contextVariables.isDataLoading ? (
        <Skeleton height={500} variant="rectangular" />
      ) : (
        <Box sx={{ mt: 8, ml: 1.5 }}>
          {pathName === '/' && <Overview />}
          <Outlet />
        </Box>
      )}
    </Box>
  );

  async function computeSortedOverviewData() {
    const overviewData = await DataService.GetOverview();

    const entries: [string, RiskLevelData][] = Object.entries(overviewData);
    entries.sort((a, b) => b[1].riskLevel - a[1].riskLevel);
    const sortedOverviewData: OverviewData = entries.reduce(
      (acc: OverviewData, riskLevelData: [string, RiskLevelData]) => {
        acc[riskLevelData[0]] = riskLevelData[1];
        return acc;
      },
      {} as OverviewData
    );

    return sortedOverviewData;
  }
}
