import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

function TournamentStandings() {
  const { id } = useParams();
  
  return (
    <Typography variant="h4">
      Tournament Standings (ID: {id})
    </Typography>
  );
}

export default TournamentStandings;