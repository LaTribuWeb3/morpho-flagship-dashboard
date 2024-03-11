import { Grid, LinearProgress, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import DataService from '../../services/DataService';
import { SimpleAlert } from '../../components/SimpleAlert';
import { DATA_SOURCES } from '../../utils/Constants';
import { OverviewData } from '../../models/OverviewData';
import { OverviewTable } from '../../components/OverviewTable';

function OverviewSkeleton() {
  const nbSkeletons = DATA_SOURCES.length - 1; // -1 because "all" sources will not be displaying data
  return (
    <Grid container spacing={1}>
      <LinearProgress color="secondary" sx={{ position: 'absolute', bottom: 5, left: 0, width: '100vw' }} />
      {Array.from({ length: nbSkeletons }).map((_, i) => (
        <Grid key={i} item xs={12} md={6}>
          <Skeleton height={175} variant="rectangular" />
        </Grid>
      ))}
    </Grid>
  );
}

export function Overview() {
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<OverviewData>({});
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  useEffect(() => {
    setIsLoading(true);
    // Define an asynchronous function
    async function fetchData() {
      try {
        const overviewData = await DataService.GetOverview();
        const entries = Object.entries(overviewData);
        entries.sort((a, b) => b[1].riskLevel - a[1].riskLevel);
        const sortedOverviewData: OverviewData = entries.reduce((acc, [symbol, data]) => {
          acc[symbol] = data;
          return acc;
      }, {} as OverviewData);

        setOverviewData(sortedOverviewData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setIsLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`Error fetching data: ${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }

    // Call the asynchronous function
    fetchData().catch(console.error);

    // You can also return a cleanup function from useEffect if needed
    return () => {
      // Perform cleanup if necessary
    };
  }, []); // Empty dependency array means this effect runs once, similar to componentDidMount

  return (
    <Grid sx={{ mt: 10 }} container spacing={2}>
      {isLoading ? <OverviewSkeleton /> 
      : 
      <OverviewTable data={overviewData} />
      }

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Grid>
  );
}
