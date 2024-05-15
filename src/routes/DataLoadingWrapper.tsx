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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        contextVariables.isDataLoading = true;

        initialContext.contextVariables.overviewData = await computeSortedOverviewData();
        initialContext.contextVariables.morphoRiskParameters = MORPHO_RISK_PARAMETERS_ARRAY[1];
        // initialContext.contextVariables.data = await DataService.GetLiquidityData(props.platform, props.pair.base, props.pair.quote);
        initialContext.contextVariables.availablePairs = await DataService.GetAvailablePairs('all');

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
