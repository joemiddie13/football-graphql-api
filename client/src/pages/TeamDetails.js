import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

function TeamDetails() {
  const { id } = useParams();
  
  return (
    <Typography variant="h4">
      Team Details (ID: {id})
    </Typography>
  );
}

export default TeamDetails;