import { Box, Skeleton } from '@mui/material';
import { useContext, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { sleep } from '../utils/Utils';
import { AppContext } from './App';
import { Overview } from './overview/Overview';
import { OverviewData } from '../models/OverviewData';
import DataService from '../services/DataService';

export default function DataLoadingWrapper() {
  const pathName = useLocation().pathname;
  const { contextVariables, setContextVariables } = useContext(AppContext);
  // You should check the context here

  useEffect(() => {
    console.log("useEffect");
    async function fetchData() {
      try {
        contextVariables.isDataLoading = true;
        setContextVariables(contextVariables);


        const overviewData: OverviewData = await DataService.GetOverview();
        const entries = Object.entries(overviewData);
        entries.sort((a, b) => b[1].riskLevel - a[1].riskLevel);
        contextVariables.overviewData = entries.reduce((acc, [symbol, data]) => {
          acc[symbol] = data;
          return acc;
        }, {} as OverviewData);

        await sleep(1000);
        contextVariables.isDataLoading = false;
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error instanceof Error) {
          console.log('Error fetching data:', error.toString());
        } else {
          console.log('Unknown error');
        }
      }
    }

    fetchData()
      .then(() => {
        setContextVariables(contextVariables);
      })
      .catch(console.error);
  }, [contextVariables, setContextVariables]);

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
}