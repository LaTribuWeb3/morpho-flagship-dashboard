import { Grid, LinearProgress, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import DataService from '../../services/DataService';
import { SimpleAlert } from '../../components/SimpleAlert';
import { DATA_SOURCES } from '../../utils/Constants';
import { LastUpdateData } from '../../models/LastUpdateData';
import { LastUpdateCard, } from '../../components/LastUpdateCard';

function LastUpdateSkeleton() {
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

export function LastUpdate() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateData, setLastUpdateData] = useState<LastUpdateData[]>([]);
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
        const lastUpdateData = await DataService.GetLastUpdate();

        setLastUpdateData(lastUpdateData);
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
    <Grid sx={{ mt: 10, ml:1, width: "99%" }} container spacing={2}>
      {/* <Grid item xs={12}>
        <Container sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Overview
          </Typography>
        </Container>
      </Grid> */}
      {isLoading ? <LastUpdateSkeleton /> : <LastUpdateCard data={lastUpdateData} />}

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Grid>
  );
}
