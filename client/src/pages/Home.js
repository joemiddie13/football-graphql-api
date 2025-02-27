import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Typography, Box, CircularProgress, Alert, Card, CardContent, 
         CardActionArea, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

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

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Alert severity="error" sx={{ mt: 2 }}>
      Error: {error.message}
    </Alert>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Champions League Explorer
      </Typography>
      
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Tournaments
      </Typography>
      
      <Grid container spacing={3}>
        {data.tournaments.map(tournament => (
          <Grid item xs={12} sm={6} md={4} key={tournament.id}>
            <Card elevation={2}>
              <CardActionArea component={RouterLink} to={`/tournaments/${tournament.id}/standings`}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {tournament.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Season: {tournament.season}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;