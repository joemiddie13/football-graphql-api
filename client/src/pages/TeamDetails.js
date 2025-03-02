import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, Box, CircularProgress, Alert, Paper, Divider,
  Card, CardContent, Grid, Chip, Avatar, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  Place as LocationIcon,
  Event as CalendarIcon,
  SportsSoccer as SoccerIcon
} from '@mui/icons-material';

const TEAM_DETAILS_QUERY = gql`
  query TeamDetails($teamId: ID!) {
    team(id: $teamId) {
      id
      name
      country
      logoUrl
      founded
    }
    matches(teamId: $teamId) {
      id
      matchDate
      scoreHome
      scoreAway
      homeTeam {
        id
        name
        logoUrl
      }
      awayTeam {
        id
        name
        logoUrl
      }
    }
  }
`;

function TeamDetails() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(TEAM_DETAILS_QUERY, {
    variables: { teamId: id },
  });

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

  // Calculate team stats
  const stats = data.matches.reduce((acc, match) => {
    // Skip upcoming matches without scores
    if (match.scoreHome === null || match.scoreAway === null) {
      return acc; 
    }

    const isHomeTeam = match.homeTeam.id === id;
    const teamScore = isHomeTeam ? match.scoreHome : match.scoreAway;
    const opponentScore = isHomeTeam ? match.scoreAway : match.scoreHome;

    // Update total stats
    acc.totalMatches += 1;
    acc.goalsScored += teamScore;
    acc.goalsConceded += opponentScore;

    // Update result counts
    if (teamScore > opponentScore) {
      acc.wins += 1;
    } else if (teamScore < opponentScore) {
      acc.losses += 1;
    } else {
      acc.draws += 1;
    }

    return acc;
  }, {
    totalMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsScored: 0,
    goalsConceded: 0
  });

  // Get win rate percentage
  const winRate = stats.totalMatches > 0 
    ? Math.round((stats.wins / stats.totalMatches) * 100) 
    : 0;

  return (
    <Box>
      {/* Team Header */}
      <Box mb={4} display="flex" alignItems="center">
        <Avatar 
          src={data.team.logoUrl} 
          alt={data.team.name}
          sx={{ width: 80, height: 80, mr: 3 }}
        />
        <Box>
          <Typography variant="h4" gutterBottom>
            {data.team.name}
          </Typography>
          <Box display="flex" alignItems="center" mb={0.5}>
            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1" color="text.secondary">
              {data.team.country}
            </Typography>
          </Box>
          {data.team.founded && (
            <Box display="flex" alignItems="center">
              <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">
                Founded: {data.team.founded}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Team Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrophyIcon sx={{ mr: 1 }} /> Performance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary" align="center">Matches</Typography>
                  <Typography variant="h6" align="center">{stats.totalMatches}</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary" align="center">Wins</Typography>
                  <Typography variant="h6" align="center" color="success.main">{stats.wins}</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary" align="center">Draws</Typography>
                  <Typography variant="h6" align="center" color="text.secondary">{stats.draws}</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary" align="center">Losses</Typography>
                  <Typography variant="h6" align="center" color="error.main">{stats.losses}</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary" align="center">Goals For</Typography>
                  <Typography variant="h6" align="center">{stats.goalsScored}</Typography>
                </Grid>
                <Grid item xs={4} sm={2}>
                  <Typography variant="body2" color="text.secondary" align="center">Goals Against</Typography>
                  <Typography variant="h6" align="center">{stats.goalsConceded}</Typography>
                </Grid>
              </Grid>
              
              <Box mt={2} display="flex" justifyContent="center">
                <Chip 
                  label={`Win Rate: ${winRate}%`}
                  color={winRate > 50 ? "success" : winRate > 30 ? "warning" : "error"}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Matches */}
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
            {data.matches.map((match) => {
              const isHomeTeam = match.homeTeam.id === id;
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

export default TeamDetails;