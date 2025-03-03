import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { 
  Typography, Box, CircularProgress, Alert, Card, CardContent, 
  Grid, Chip, Avatar, Divider, Tabs, Tab, useMediaQuery, useTheme
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  Place as LocationIcon,
  Event as CalendarIcon,
  SportsSoccer as SoccerIcon,
  People as PeopleIcon
} from '@mui/icons-material';

// Import our new components
import PlayersList from '../components/PlayersList';
import MatchesList from '../components/MatchesList';

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
    players(teamId: $teamId) {
      id
      name
      position
      nationality
      age
      jerseyNumber
      goals
      assists
      appearances
    }
  }
`;

function TeamDetails() {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { loading, error, data } = useQuery(TEAM_DETAILS_QUERY, {
    variables: { teamId: id },
  });
  const [activeTab, setActiveTab] = useState('overview');

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

  // Render recent matches for overview
  const renderRecentMatches = () => {
    if (data.matches.length === 0) return null;
    
    const recentMatches = data.matches.slice(0, 3);
    
    return (
      <Grid container spacing={2}>
        {recentMatches.map(match => {
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
            <Grid item xs={12} sm={4} key={match.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {new Date(match.matchDate).toLocaleDateString()}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" my={1}>
                    <Box sx={{ width: '40%', textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={isHomeTeam ? 'bold' : 'normal'}>
                        {match.homeTeam.name}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '20%', textAlign: 'center' }}>
                      {isPlayed ? (
                        <Typography variant="body2" fontWeight="bold">
                          {match.scoreHome} - {match.scoreAway}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          vs
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ width: '40%', textAlign: 'left' }}>
                      <Typography variant="body2" fontWeight={!isHomeTeam ? 'bold' : 'normal'}>
                        {match.awayTeam.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="center">
                    <Chip 
                      label={result}
                      color={resultColor}
                      size="small"
                      variant={result === "Upcoming" ? "outlined" : "filled"}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

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

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Squad" value="squad" />
          <Tab label="Matches" value="matches" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
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

            <Grid item xs={12} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Squad Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {data.players && data.players.length > 0 ? (
                    <>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Squad Size:</Typography>
                        <Typography variant="body2" fontWeight="bold">{data.players.length} players</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Goalkeepers:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {data.players.filter(p => p.position === 'Goalkeeper').length}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Defenders:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {data.players.filter(p => p.position === 'Defender').length}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Midfielders:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {data.players.filter(p => p.position === 'Midfielder').length}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Forwards:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {data.players.filter(p => p.position === 'Forward').length}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Top Scorer:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {data.players.length > 0 ? 
                            data.players.reduce((max, p) => p.goals > max.goals ? p : max).name : 
                            'N/A'
                          }
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Top Assists:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {data.players.length > 0 ? 
                            data.players.reduce((max, p) => p.assists > max.assists ? p : max).name : 
                            'N/A'
                          }
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No player data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick match summary */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <SoccerIcon sx={{ mr: 1 }} /> Recent Matches
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {data.matches.length > 0 ? (
                    <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                      {renderRecentMatches()}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No match data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Squad Tab */}
      {activeTab === 'squad' && (
        <PlayersList players={data.players} />
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <MatchesList matches={data.matches} teamId={id} />
      )}
    </Box>
  );
}

export default TeamDetails;