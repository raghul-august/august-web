'use client';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Optimized theme for library/tools pages
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#206E55',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    }
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

export default function MUIProviders({ children }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: false }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
