import { Box } from '@mui/material';
import React, { createContext } from 'react';
import { ResponsiveNavBar } from '../components/ResponsiveNavBar';
import { MainAppBar } from '../components/MainAppBar';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Overview } from './overview/Overview';
import { AppContextType, ContextVariables } from '../models/Context';
import DataLoadingWrapper from './DataLoadingWrapper';

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
    isDataLoading: false,
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

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const pathName = useLocation().pathname;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppContext.Provider value={{ contextVariables, setContextVariables }}>
        <MainAppBar toggleDrawerFct={toggleDrawer} />
        <ResponsiveNavBar drawerWidth={drawerWidth} open={openDrawer} toggleDrawerFct={toggleDrawer} />
        <DataLoadingWrapper />
      </AppContext.Provider>
    </Box>
  );
}
export default App;
