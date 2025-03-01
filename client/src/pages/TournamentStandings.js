import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, Box, CircularProgress, Alert, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, useMediaQuery, useTheme, Card, CardContent,
  Divider, Avatar, IconButton, Tooltip, Skeleton
} from '@mui/material';
import { 
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SportsSoccer as SoccerIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// GraphQL query for tournament standings
const TOURNAMENT_STANDINGS_QUERY = gql`
  query TournamentStandings($tournamentId: ID!) {
    tournament(id: $tournamentId) {
      id
      name
      season
    }
    teamRankings(tournamentId: $tournamentId) {
      team {
        id
        name
        country
        logoUrl
      }
      points
      wins
      draws
      losses
      matchesPlayed
      goalsFor
      goalsAgainst
      goalDifference
    }
  }
`;

function TournamentStandings() {
  const { id } = useParams();
  const tournamentId = id || "1"; // Default to tournament ID 1 if not provided
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { loading, error, data, refetch } = useQuery(TOURNAMENT_STANDINGS_QUERY, {
    variables: { tournamentId },
    fetchPolicy: 'cache-and-network', // Use cache but refetch in background
  });

  // Function to get team initials for avatar fallback
  const getTeamInitials = (teamName) => {
    if (!teamName) return '?';
    
    // Extract initials from name
    const words = teamName.split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    
    // For multi-word team names, get first letter of first and last words
    const firstInitial = words[0][0];
    const lastInitial = words[words.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Function to get background color for team avatar fallback
  const getAvatarBgColor = (teamName) => {
    if (!teamName) return theme.palette.grey[400];
    
    // Generate a pseudo-random but consistent color based on team name
    const hash = teamName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Use the hash to create a hue (0-360) and generate an HSL color
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 40%)`;
  };

  // Loading state with skeleton UI
  if (loading && !data) return (
    <Box>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={30} sx={{ mb: 4 }} />
      
      <Skeleton variant="text" width="200px" height={35} sx={{ mb: 2 }} />
      
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              {Array(isMobile ? 4 : isTablet ? 7 : 10).fill(0).map((_, i) => (
                <TableCell key={i}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array(8).fill(0).map((_, i) => (
              <TableRow key={i}>
                {Array(isMobile ? 4 : isTablet ? 7 : 10).fill(0).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  
  // Error state
  if (error && !data) return (
    <Alert 
      severity="error" 
      sx={{ mt: 2 }}
      action={
        <IconButton
          color="inherit"
          size="small"
          onClick={() => refetch()}
        >
          <RefreshIcon />
        </IconButton>
      }
    >
      <Typography variant="subtitle1">Error loading data</Typography>
      <Typography variant="body2">{error.message}</Typography>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Click the refresh button to try again.
      </Typography>
    </Alert>
  );

  // Empty data handling
  if (data && (!data.teamRankings || data.teamRankings.length === 0)) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="subtitle1">No team rankings available</Typography>
        <Typography variant="body2">
          This tournament may not have started yet, or there might be an issue with the data.
        </Typography>
      </Alert>
    );
  }

  // Function to determine team status for visual indicators
  const getTeamStatus = (position) => {
    if (position <= 8) {
      return { color: 'success', label: 'Knockout stage' };
    } else if (position <= 16) {
      return { color: 'info', label: 'Playoff round' };
    } else if (position <= 24) {
      return { color: 'warning', label: 'Europa League' };
    } else {
      return { color: 'error', label: 'Eliminated' };
    }
  };

  // Function to render form guide (last 5 matches)
  const renderFormGuide = (position) => {
    // This would be based on actual match data
    // Mock form based on team position for demonstration
    const mockForms = {
      1: ['W', 'W', 'W', 'W', 'D'],
      2: ['W', 'W', 'W', 'D', 'W'],
      3: ['W', 'W', 'D', 'W', 'W'],
      4: ['W', 'D', 'W', 'W', 'L'],
      5: ['D', 'W', 'W', 'W', 'D'],
      6: ['W', 'W', 'L', 'W', 'W'],
      7: ['W', 'L', 'W', 'W', 'D'],
      8: ['L', 'W', 'W', 'W', 'W']
    };
    
    // Use mock data or generate random form
    const forms = mockForms[position] || Array(5).fill().map(() => {
      const rand = Math.random();
      if (rand > 0.6) return 'W';
      if (rand > 0.3) return 'D';
      return 'L';
    });
    
    return (
      <Box display="flex" gap={0.5}>
        {forms.map((result, index) => {
          let color = 'default';
          if (result === 'W') color = 'success';
          if (result === 'D') color = 'warning';
          if (result === 'L') color = 'error';
          
          return (
            <Tooltip key={index} title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}>
              <Chip 
                label={result} 
                size="small" 
                color={color}
                sx={{ 
                  height: 20, 
                  minWidth: 20, 
                  fontSize: '0.7rem',
                  display: { xs: 'none', md: 'flex' }
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    );
  };

  const renderTeamLogo = (team) => {
    // For debugging - log the logo URL to see what's coming from the API
    console.log(`Team: ${team.name}, Logo URL: ${team.logoUrl}`);
    
    // Check if logo URL exists and doesn't contain invalid patterns
    const hasValidLogo = team.logoUrl && 
                        !team.logoUrl.includes('example.com') && 
                        !team.logoUrl.includes('placeholder') &&
                        team.logoUrl.startsWith('http');
    
    if (hasValidLogo) {
      return (
        <Avatar 
          src={team.logoUrl}
          alt={team.name}
          sx={{ height: 28, width: 28, mr: 1 }}
          imgProps={{
            onError: (e) => {
              // Log the error when an image fails to load
              console.error(`Failed to load logo for ${team.name}: ${team.logoUrl}`);
              // If image fails to load, replace src with empty string to show fallback
              e.target.onerror = null;
              e.target.src = "";
            }
          }}
        >
          {getTeamInitials(team.name)}
        </Avatar>
      );
    }
    
    // Fallback to text avatar with team initials
    return (
      <Avatar 
        sx={{ 
          height: 28, 
          width: 28, 
          mr: 1, 
          fontSize: '0.8rem',
          bgcolor: getAvatarBgColor(team.name)
        }}
      >
        {getTeamInitials(team.name)}
      </Avatar>
    );
  };

  // Function to render the table for desktop/tablet
  const renderTable = () => (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: isTablet ? 650 : 900 }} aria-label="tournament standings table">
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', width: '40px' }}>#</TableCell>
            <TableCell sx={{ color: 'white' }}>Team</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>MP</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>W</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>D</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>L</TableCell>
            {!isTablet && (
              <>
                <TableCell align="center" sx={{ color: 'white' }}>GF</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>GA</TableCell>
              </>
            )}
            <TableCell align="center" sx={{ color: 'white' }}>GD</TableCell>
            <TableCell align="center" sx={{ color: 'white' }}>Pts</TableCell>
            {!isTablet && (
              <TableCell align="center" sx={{ color: 'white' }}>Form</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.teamRankings.map((ranking, index) => {
            // Use index + 1 as position
            const position = index + 1;
            const status = getTeamStatus(position);
            
            return (
              <TableRow
                key={ranking.team.id}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  backgroundColor: index % 2 === 0 ? 'action.hover' : 'inherit',
                  // Add left border with color based on qualification status
                  borderLeft: `4px solid ${theme.palette[status.color].main}`
                }}
              >
                <TableCell component="th" scope="row">
                  <Box display="flex" alignItems="center">
                    {position}
                    {position <= 3 && (
                      <ArrowUpwardIcon 
                        fontSize="small" 
                        color="success"
                        sx={{ ml: 0.5, height: 16 }}
                      />
                    )}
                    {position > 20 && data.teamRankings.length > 20 && (
                      <ArrowDownwardIcon 
                        fontSize="small" 
                        color="error"
                        sx={{ ml: 0.5, height: 16 }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box 
                    component={RouterLink} 
                    to={`/teams/${ranking.team.id}`}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    {renderTeamLogo(ranking.team)}
                    <Box>
                      <Typography variant="body2" component="span" fontWeight="medium">
                        {ranking.team.name}
                      </Typography>
                      <Typography variant="caption" component="div" color="text.secondary">
                        {ranking.team.country}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">{ranking.matchesPlayed}</TableCell>
                <TableCell align="center">{ranking.wins}</TableCell>
                <TableCell align="center">{ranking.draws}</TableCell>
                <TableCell align="center">{ranking.losses}</TableCell>
                {!isTablet && (
                  <>
                    <TableCell align="center">{ranking.goalsFor}</TableCell>
                    <TableCell align="center">{ranking.goalsAgainst}</TableCell>
                  </>
                )}
                <TableCell align="center">
                  <Chip 
                    label={ranking.goalDifference > 0 ? `+${ranking.goalDifference}` : ranking.goalDifference} 
                    size="small"
                    color={ranking.goalDifference > 0 ? "success" : ranking.goalDifference < 0 ? "error" : "default"}
                    variant="outlined"
                    sx={{ minWidth: 36 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="bold">
                    {ranking.points}
                  </Typography>
                </TableCell>
                {!isTablet && (
                  <TableCell align="center">
                    {renderFormGuide(position)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Function to render mobile cards
  const renderMobileCards = () => (
    <Box>
      {data.teamRankings.map((ranking, index) => {
        const position = index + 1;
        const status = getTeamStatus(position);
        
        return (
          <Card 
            key={ranking.team.id} 
            sx={{ 
              mb: 2,
              borderLeft: `4px solid ${theme.palette[status.color].main}`
            }}
            component={RouterLink}
            to={`/teams/${ranking.team.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" sx={{ mr: 2, minWidth: '24px' }}>
                    {position}
                  </Typography>
                  
                  <Box display="flex" alignItems="center">
                    {renderTeamLogo({...ranking.team, height: 32, width: 32})}
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {ranking.team.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ranking.team.country}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box textAlign="right">
                  <Chip 
                    label={`${ranking.points} pts`}
                    color="primary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" display="block">
                    MP: {ranking.matchesPlayed} • W: {ranking.wins} • D: {ranking.draws} • L: {ranking.losses}
                  </Typography>
                  <Typography variant="caption" display="block">
                    GD: {ranking.goalDifference > 0 ? `+${ranking.goalDifference}` : ranking.goalDifference} 
                    ({ranking.goalsFor}-{ranking.goalsAgainst})
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );

  // Legend to explain the colors
  const renderLegend = () => (
    <Box mt={3} p={2} component={Paper} variant="outlined">
      <Typography variant="subtitle1" gutterBottom fontWeight="medium">
        Qualification Status
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {[
          { color: 'success', label: 'Knockout stage' },
          { color: 'info', label: 'Playoff round' },
          { color: 'warning', label: 'Europa League' },
          { color: 'error', label: 'Eliminated' }
        ].map((status, index) => (
          <Box key={index} display="flex" alignItems="center">
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: theme.palette[status.color].main,
                mr: 1
              }} 
            />
            <Typography variant="body2">
              {status.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          {data.tournament.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Season: {data.tournament.season}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          Standings
        </Typography>
        <Tooltip title="Refresh standings data">
          <IconButton size="small" onClick={() => refetch()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Show loading indicator if refreshing but display existing data */}
      {loading && data && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {isMobile ? renderMobileCards() : renderTable()}
      
      {renderLegend()}
      
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Typography variant="caption" color="text.secondary">
          Data from 2023-2024 UEFA Champions League
        </Typography>
      </Box>
    </Box>
  );
}

export default TournamentStandings;