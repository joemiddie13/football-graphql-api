// client/src/pages/Home.js
import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { 
  Typography, Box, CircularProgress, Alert, Card, CardContent, 
  CardActionArea, Grid, Container, Divider, useTheme, 
  CardMedia, CardActions, Button, Paper, Skeleton, Chip,
  Avatar
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon, 
  SportsSoccer as SoccerIcon, 
  BarChart as StatsIcon,
  Explore as ExploreIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
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

// Additional query for featured teams
const GET_FEATURED_TEAMS = gql`
  query {
    teams(limit: 6) {
      id
      name
      country
      logoUrl
    }
  }
`;

function Home() {
  const theme = useTheme();
  const { loading: loadingTournaments, error: tournamentsError, data: tournamentsData } = useQuery(GET_TOURNAMENTS);
  
  // We'll simulate the teams for now as the query might not exist yet
  const featuredTeams = [
    { id: 1, name: 'Real Madrid', country: 'Spain', logoUrl: 'https://media-3.api-sports.io/football/teams/541.png' },
    { id: 2, name: 'Bayern Munich', country: 'Germany', logoUrl: 'https://media-3.api-sports.io/football/teams/157.png' },
    { id: 3, name: 'Liverpool', country: 'England', logoUrl: 'https://media-3.api-sports.io/football/teams/40.png' },
    { id: 4, name: 'Paris Saint-Germain', country: 'France', logoUrl: 'https://media-3.api-sports.io/football/teams/85.png' }
  ];

  // Loading skeletons for tournaments
  const renderTournamentSkeletons = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Card elevation={2}>
            <CardContent>
              <Skeleton variant="text" height={40} width="80%" />
              <Divider sx={{ my: 1 }} />
              <Skeleton variant="text" height={30} width="60%" />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="rounded" height={36} width={100} />
                <Skeleton variant="rounded" height={36} width={100} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      {/* Hero section */}
      <Paper 
        elevation={3} 
        sx={{
          p: 4,
          mb: 6,
          mt: 2,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ maxWidth: { xs: '100%', md: '60%' }, zIndex: 2 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight="bold"
            sx={{
              mb: 2,
              textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Champions League Explorer
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Explore teams, matches, and standings from Europe's premier football competition
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={RouterLink}
              to="/tournaments"
              endIcon={<ExploreIcon />}
              sx={{ fontWeight: 'bold' }}
            >
              Explore Tournaments
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              component={RouterLink}
              to="/teams"
              sx={{ borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              View Teams
            </Button>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'block' },
            width: '300px',
            height: '300px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <SoccerIcon 
            sx={{ 
              fontSize: '300px', 
              opacity: 0.2,
              position: 'absolute',
              top: 0,
              right: -50
            }}
          />
          <TrophyIcon
            sx={{ 
              fontSize: '220px',
              color: '#ffeb3b',
              position: 'absolute',
              top: 40,
              right: 40
            }}
          />
        </Box>

        {/* Mobile version of the icon */}
        <Box 
          sx={{ 
            display: { xs: 'block', md: 'none' },
            width: '100%',
            height: '120px',
            position: 'relative',
            mt: 2
          }}
        >
          <TrophyIcon
            sx={{ 
              fontSize: '120px',
              color: '#ffeb3b',
              margin: '0 auto',
              display: 'block'
            }}
          />
        </Box>
      </Paper>

      {/* Tournaments section */}
      <Box mb={6}>
        <Box display="flex" alignItems="center" mb={3}>
          <TrophyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h2">
            Tournaments
          </Typography>
        </Box>
        
        {loadingTournaments ? (
          renderTournamentSkeletons()
        ) : tournamentsError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error: {tournamentsError.message}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {tournamentsData.tournaments.map(tournament => (
              <Grid item xs={12} sm={6} md={4} key={tournament.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrophyIcon sx={{ color: 'gold', mr: 1 }} />
                      <Typography variant="h5" component="div">
                        {tournament.name}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Season: {tournament.season}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        component={RouterLink}
                        to={`/tournaments/${tournament.id}/standings`}
                        endIcon={<StatsIcon />}
                      >
                        Standings
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        size="small"
                        component={RouterLink}
                        to={`/tournaments/${tournament.id}/matches`}
                        endIcon={<SoccerIcon />}
                      >
                        Matches
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Featured Teams section */}
      <Box mb={6}>
        <Box display="flex" alignItems="center" mb={3}>
          <SoccerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h2">
            Featured Teams
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {featuredTeams.map(team => (
            <Grid item xs={6} sm={3} key={team.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  textAlign: 'center'
                }}
              >
                <Avatar 
                  src={team.logoUrl} 
                  alt={team.name}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
                <Typography variant="h6" component="div" gutterBottom noWrap>
                  {team.name}
                </Typography>
                <Chip 
                  label={team.country} 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="outlined" 
                  color="primary" 
                  component={RouterLink}
                  to={`/teams/${team.id}`}
                  sx={{ mt: 'auto' }}
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                >
                  Team Profile
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Latest Matches section (placeholder) */}
      <Box mb={6}>
        <Box display="flex" alignItems="center" mb={3}>
          <SoccerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h2">
            Recent Matches
          </Typography>
        </Box>
        
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <SoccerIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="div" gutterBottom>
              Match Explorer Coming Soon
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Browse upcoming fixtures and past results from the Champions League
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              component={RouterLink}
              to="/matches"
            >
              Explore All Matches
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Home;