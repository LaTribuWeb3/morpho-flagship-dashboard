import { ThemeOptions, createTheme } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#000000'
    },
    secondary: {
      main: '#0023f5'
    }
  },
  typography: {
    fontFamily: 'monospace'
  }
};

const theme = createTheme(themeOptions);

export default theme;
