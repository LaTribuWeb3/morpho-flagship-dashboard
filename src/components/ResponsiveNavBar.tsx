import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { NavCategories } from './NavCategories';

export interface ResponsiveNavBarProperties {
  open: boolean;
  toggleDrawerFct: () => void;
  drawerWidth: number;
}

export function ResponsiveNavBar(props: ResponsiveNavBarProperties) {
  return (
    <Box component="nav" sx={{ width: { md: props.drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
      <Drawer
        variant="temporary"
        open={props.open}
        onClose={props.toggleDrawerFct}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.drawerWidth }
        }}
      >
        <NavCategories toggleDrawerFct={props.toggleDrawerFct} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'flex' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.drawerWidth }
        }}
        open
      >
        <NavCategories toggleDrawerFct={props.toggleDrawerFct} />
      </Drawer>
    </Box>
  );
}
