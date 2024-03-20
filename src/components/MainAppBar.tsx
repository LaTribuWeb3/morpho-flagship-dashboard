import { Avatar, Box, Typography, styled } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

export interface MainAppBarProperties {
  toggleDrawerFct: () => void;
}

export function MainAppBar(props: MainAppBarProperties) {
  return (
    <AppBar position="absolute">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={props.toggleDrawerFct}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Avatar
          variant="rounded"
          alt="b protocol logo"
          src="/favicon.svg"
          sx={{ width: 45, height: 35, padding: 0.5 }}
        />
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Avatar alt="Morpho logo" src="/morpho.svg" sx={{ width: 45, height: 45, padding: 0.25 }} />
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            Morpho SmartLTV Monitor
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
