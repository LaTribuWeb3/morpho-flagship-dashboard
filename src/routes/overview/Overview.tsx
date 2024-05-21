import { Grid } from '@mui/material';
import { useContext, useState } from 'react';
import { OverviewTable } from '../../components/OverviewTable';
import { SimpleAlert } from '../../components/SimpleAlert';
import { AppContext } from '../App';

export function Overview() {
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg] = useState('');
  const { contextVariables } = useContext(AppContext);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <Grid sx={{ mt: 10 }} container spacing={2}>
      <OverviewTable data={contextVariables.overviewData} />

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Grid>
  );
}
