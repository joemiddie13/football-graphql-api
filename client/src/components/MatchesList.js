import React from 'react';
import { 
  Typography, Box, Alert, Paper, Divider, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar
} from '@mui/material';
import { SportsSoccer as SoccerIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

function MatchesList({ matches, teamId }) {
  if (!matches || matches.length === 0) {
    return (
      <Alert severity="info">
        No matches available for this team.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SoccerIcon sx={{ mr: 1 }} /> Matches
      </Typography>
      
      <TableContainer component={Paper} elevation={2}>
        <Table aria-label="matches table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Home</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Score</TableCell>
              <TableCell sx={{ color: 'white' }}>Away</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((match) => {
              const isHomeTeam = match.homeTeam.id === teamId;
              const isPlayed = match.scoreHome !== null && match.scoreAway !== null;
              
              // Determine result from team's perspective
              let result = "Upcoming";
              let resultColor = "default";
              
              if (isPlayed) {
                const teamScore = isHomeTeam ? match.scoreHome : match.scoreAway;
                const opponentScore = isHomeTeam ? match.scoreAway : match.scoreHome;
                
                if (teamScore > opponentScore) {
                  result = "Win";
                  resultColor = "success";
                } else if (teamScore < opponentScore) {
                  result = "Loss";
                  resultColor = "error";
                } else {
                  result = "Draw";
                  resultColor = "warning";
                }
              }
              
              return (
                <TableRow 
                  key={match.id}
                  sx={{ 
                    '&:hover': { backgroundColor: 'action.hover' },
                    backgroundColor: isHomeTeam ? 'rgba(0, 0, 255, 0.03)' : 'inherit'
                  }}
                >
                  <TableCell>
                    {new Date(match.matchDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box 
                      component={RouterLink} 
                      to={`/teams/${match.homeTeam.id}`}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      {match.homeTeam.logoUrl && (
                        <Avatar 
                          src={match.homeTeam.logoUrl} 
                          alt={match.homeTeam.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                      )}
                      <Typography 
                        variant="body2"
                        fontWeight={isHomeTeam ? 'bold' : 'normal'}
                      >
                        {match.homeTeam.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {isPlayed ? (
                      <Typography variant="body2" fontWeight="bold">
                        {match.scoreHome} - {match.scoreAway}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Upcoming
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box 
                      component={RouterLink} 
                      to={`/teams/${match.awayTeam.id}`}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      {match.awayTeam.logoUrl && (
                        <Avatar 
                          src={match.awayTeam.logoUrl} 
                          alt={match.awayTeam.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                      )}
                      <Typography 
                        variant="body2"
                        fontWeight={!isHomeTeam ? 'bold' : 'normal'}
                      >
                        {match.awayTeam.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={result}
                      color={resultColor}
                      size="small"
                      variant={result === "Upcoming" ? "outlined" : "filled"}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default MatchesList;