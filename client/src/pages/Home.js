import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';

// GraphQL query to fetch tournaments
const GET_TOURNAMENTS = gql`
  query {
    tournaments {
      id
      name
      season
    }
  }
`;

function Home() {
  const { loading, error, data } = useQuery(GET_TOURNAMENTS);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Champions League GraphQL App
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Tournaments
      </Typography>
      
      {data.tournaments.map(tournament => (
        <Box key={tournament.id} mb={2}>
          <Typography variant="body1">
            {tournament.name} - {tournament.season}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default Home;