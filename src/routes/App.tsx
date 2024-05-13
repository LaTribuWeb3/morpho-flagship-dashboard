import { Box } from '@mui/material';
import React, { createContext } from 'react';
import { useLocation } from 'react-router-dom';
import { MainAppBar } from '../components/MainAppBar';
import { ResponsiveNavBar } from '../components/ResponsiveNavBar';
import { AppContextProperties, appContextType } from '../models/AppContext';
import { initialContext } from '../utils/Constants';
import DataLoadingWrapper from './DataLoadingWrapper';

const drawerWidth = 240;

export const AppContext = createContext<appContextType>(initialContext);

function App() {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [contextVariables, setContextVariables] = React.useState<AppContextProperties>(initialContext.contextVariables);

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
