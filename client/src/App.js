import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import client from './apolloClient';

import Home from './pages/Home';
import TournamentStandings from './pages/TournamentStandings';
import TeamDetails from './pages/TeamDetails';

function App() {
  return (
    <ApolloProvider client={client}>
      <CssBaseline />
      <BrowserRouter>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments/:id/standings" element={<TournamentStandings />} />
            <Route path="/teams/:id" element={<TeamDetails />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;