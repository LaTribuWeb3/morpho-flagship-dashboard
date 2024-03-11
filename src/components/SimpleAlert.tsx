import { Alert } from '@mui/material';

export interface SimpleAlertInterface {
  openAlert: boolean;
  alertMsg: string;
  handleCloseAlert: () => void;
}

export function SimpleAlert(props: SimpleAlertInterface) {
  return props.openAlert ? (
    <Alert
      sx={{ position: 'absolute', bottom: 10, right: 1 }}
      variant="filled"
      severity="error"
      onClose={props.handleCloseAlert}
    >
      {props.alertMsg}
    </Alert>
  ) : (
    <></>
  );
}
