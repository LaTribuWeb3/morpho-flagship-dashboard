import { Box } from '@mui/material';
import React, { createContext } from 'react';
import { ResponsiveNavBar } from '../components/ResponsiveNavBar';
import { MainAppBar } from '../components/MainAppBar';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Overview } from './overview/Overview';
import { AppContextType, ContextVariables } from '../models/Context';

const drawerWidth = 240;

const defaultContextValue: AppContextType = {
  contextVariables: {
    riskContext: {
      current: false,
      pair: { base: '', quote: '' },
      LTV: 0,
      liquidationBonus: 0,
      supplyCapInLoanAsset: 0,
      loanAssetPrice: 0
    },
    datasourcesContext: {
      current: false,
      pair: { base: '', quote: '' },
      datasource: '',
      slippage: 0
    }
  },
  setContextVariables: () => {}
};
export const AppContext = createContext<AppContextType>(defaultContextValue);

function App() {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [contextVariables, setContextVariables] = React.useState<ContextVariables>({
    riskContext: {
      current: false,
      pair: { base: '', quote: '' },
      LTV: 0,
      liquidationBonus: 0,
      supplyCapInLoanAsset: 0,
      loanAssetPrice: 0
    },
    datasourcesContext: { current: false, pair: { base: '', quote: '' }, datasource: '', slippage: 0 }
  });
  console.log({ contextVariables });

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const pathName = useLocation().pathname;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppContext.Provider value={{ contextVariables, setContextVariables }}>
        <MainAppBar toggleDrawerFct={toggleDrawer} />
        <ResponsiveNavBar drawerWidth={drawerWidth} open={openDrawer} toggleDrawerFct={toggleDrawer} />
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
          <Box sx={{ mt: 8, ml: 1.5 }}>
            {pathName == '/' && <Overview />}
            <Outlet />
          </Box>
        </Box>
      </AppContext.Provider>
    </Box>
  );
}
export default App;
