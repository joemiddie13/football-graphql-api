import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Container, 
  Typography, 
  Alert 
} from '@mui/material';
import client from './apolloClient';

// Pages
import Home from './pages/Home';
import TournamentStandings from './pages/TournamentStandings';
import TeamDetails from './pages/TeamDetails';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00b0ff',
      light: '#69e2ff',
      dark: '#0081cb',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: '0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 'bold',
        },
      },
    },
  },
});

// Define the App component
export default function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            <Navbar />
            <Box component="main" sx={{ pt: 3, pb: 5, flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tournaments/:id/standings" element={<TournamentStandings />} />
                <Route path="/teams/:id" element={<TeamDetails />} />
                <Route path="/tournaments" element={<Home />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/matches" element={<MatchesPage />} /> {}
              </Routes>
            </Box>
            <Footer />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </ApolloProvider>
  );
}