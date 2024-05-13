import { Grid } from '@mui/material';
import { useContext } from 'react';
import { OverviewTable } from '../../components/OverviewTable';
import { OverviewData } from '../../models/OverviewData';
import { AppContext } from '../App';

export function Overview() {
  const appContext = useContext(AppContext).contextVariables;
  const overviewData: OverviewData = appContext.overviewData;

  return (
    <Grid sx={{ mt: 10 }} container spacing={2}>
      <OverviewTable data={overviewData} />
    </Grid>
  );
}
