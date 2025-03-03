import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { 
  Typography, Box, CircularProgress, Alert, Card, CardContent, 
  Grid, Container, TextField, InputAdornment, Divider,
  FormControl, InputLabel, Select, MenuItem, Pagination,
  Chip, Avatar, useMediaQuery, useTheme, Button, 
  Paper, IconButton, Tooltip, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Tab, Tabs
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  SportsSoccer as SoccerIcon,
  Today as TodayIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';

// GraphQL query for matches with pagination
const GET_MATCHES = gql`
  query GetMatches(
    $after: String, 
    $first: Int, 
    $tournamentId: ID, 
    $teamId: ID, 
    $fromDate: ISO8601DateTime, 
    $toDate: ISO8601DateTime
  ) {
    matchesConnection(
      first: $first, 
      after: $after,
      tournament_id: $tournamentId,
      team_id: $teamId,
      from_date: $fromDate,
      to_date: $toDate
    ) {
      edges {
        node {
          id
          matchDate
          scoreHome
          scoreAway
          homeTeam {
            id
            name
            logoUrl
            country
          }
          awayTeam {
            id
            name
            logoUrl
            country
          }
          tournament {
            id
            name
            season
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

// GraphQL query for tournaments (for filters)
const GET_TOURNAMENTS = gql`
  query {
    tournaments {
      id
      name
      season
    }
  }
`;

// GraphQL query for teams (for filters)
const GET_TEAMS = gql`
  query {
    teams {
      id
      name
      country
    }
  }
`;

function MatchesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for filters
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // 'all', 'upcoming', 'past', 'today'
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Process date range filter into actual date objects
  const getDateRangeValues = () => {
    const now = new Date();
    switch (dateRangeFilter) {
      case 'upcoming':
        return { fromDate: now.toISOString(), toDate: null };
      case 'past':
        return { fromDate: null, toDate: now.toISOString() };
      case 'today':
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        return { fromDate: startOfDay, toDate: endOfDay };
      default:
        return { fromDate: null, toDate: null };
    }
  };
  
  const { fromDate, toDate } = getDateRangeValues();

  // GraphQL query with variables
  const { loading, error, data, fetchMore, refetch } = useQuery(GET_MATCHES, {
    variables: {
      first: itemsPerPage,
      tournamentId: tournamentFilter || null,
      teamId: teamFilter || null,
      fromDate: fromDate,
      toDate: toDate
    },
    fetchPolicy: 'cache-and-network', // Use cache but update in background
  });

  // Get tournaments for filter dropdown
  const { data: tournamentsData } = useQuery(GET_TOURNAMENTS);
  
  // Get teams for filter dropdown
  const { data: teamsData } = useQuery(GET_TEAMS);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tournamentFilter, teamFilter, dateRangeFilter]);

  // Handle tournament filter change
  const handleTournamentFilterChange = (event) => {
    setTournamentFilter(event.target.value);
  };

  // Handle team filter change
  const handleTeamFilterChange = (event) => {
    setTeamFilter(event.target.value);
  };

  // Handle date range filter change
  const handleDateRangeFilterChange = (event, newValue) => {
    setDateRangeFilter(newValue);
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    
    // If we already have the data for this page, no need to fetch more
    if (data?.matchesConnection?.edges?.length >= value * itemsPerPage) {
      return;
    }
    
    // Otherwise, fetch more data
    fetchMore({
      variables: {
        after: data?.matchesConnection?.pageInfo?.endCursor,
        first: itemsPerPage
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          matchesConnection: {
            __typename: 'MatchConnection',
            edges: [
              ...prev.matchesConnection.edges,
              ...fetchMoreResult.matchesConnection.edges
            ],
            pageInfo: fetchMoreResult.matchesConnection.pageInfo,
            totalCount: fetchMoreResult.matchesConnection.totalCount
          }
        };
      }
    });
  };

  // Get the matches for the current page
  const getCurrentPageMatches = () => {
    if (!data?.matchesConnection?.edges) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.matchesConnection.edges
      .slice(startIndex, startIndex + itemsPerPage)
      .map(edge => edge.node);
  };

  // Calculate total pages
  const totalPages = data?.matchesConnection?.totalCount 
    ? Math.ceil(data.matchesConnection.totalCount / itemsPerPage) 
    : 0;

  // Function to determine match status and appropriate styling
  const getMatchStatus = (match) => {
    if (!match.matchDate) return { label: 'Unknown', color: 'default' };
    
    const matchDate = parseISO(match.matchDate);
    const hasScores = match.scoreHome !== null && match.scoreAway !== null;
    
    if (hasScores) {
      if (match.scoreHome > match.scoreAway) {
        return { label: 'Home Win', color: 'success' };
      } else if (match.scoreHome < match.scoreAway) {
        return { label: 'Away Win', color: 'error' };
      } else {
        return { label: 'Draw', color: 'warning' };
      }
    } else if (isToday(matchDate)) {
      return { label: 'Today', color: 'secondary' };
    } else if (isFuture(matchDate)) {
      return { label: 'Upcoming', color: 'info' };
    } else {
      return { label: 'No Result', color: 'default' };
    }
  };

  // Render loading state
  if (loading && !data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Matches
        </Typography>
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error && !data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Matches
        </Typography>
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
          <Typography variant="subtitle1">Error loading matches</Typography>
          <Typography variant="body2">{error.message}</Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Click the refresh button to try again.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <SoccerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4">
            Matches
          </Typography>
        </Box>

        {loading && data && (
          <CircularProgress size={24} />
        )}
      </Box>

      {/* Filter Controls */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Tournament</InputLabel>
              <Select
                value={tournamentFilter}
                label="Tournament"
                onChange={handleTournamentFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <TrophyIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Tournaments</MenuItem>
                {tournamentsData?.tournaments?.map(tournament => (
                  <MenuItem key={tournament.id} value={tournament.id}>
                    {tournament.name} ({tournament.season})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Team</InputLabel>
              <Select
                value={teamFilter}
                label="Team"
                onChange={handleTeamFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SoccerIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Teams</MenuItem>
                {teamsData?.teams?.map(team => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name} ({team.country})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={dateRangeFilter} 
                onChange={handleDateRangeFilterChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
              >
                <Tab 
                  icon={<CalendarIcon fontSize="small" />} 
                  label="All" 
                  value="all" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<TodayIcon fontSize="small" />} 
                  label="Today" 
                  value="today" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<ScheduleIcon fontSize="small" />} 
                  label="Upcoming" 
                  value="upcoming" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<ArrowForwardIcon fontSize="small" />} 
                  label="Past" 
                  value="past" 
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Showing {data?.matchesConnection?.edges?.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {
            Math.min(currentPage * itemsPerPage, data?.matchesConnection?.totalCount || 0)
          } of {data?.matchesConnection?.totalCount || 0} matches
        </Typography>
        
        <Tooltip title="Refresh matches data">
          <IconButton size="small" onClick={() => refetch()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Matches Table/List */}
      {getCurrentPageMatches().length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No matches found matching your criteria.
        </Alert>
      ) : isMobile ? (
        // Mobile view: Display as cards
        <Box>
          {getCurrentPageMatches().map(match => {
            const status = getMatchStatus(match);
            
            return (
              <Card key={match.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {match.matchDate && format(parseISO(match.matchDate), 'MMM d, yyyy')}
                    </Typography>
                    <Chip 
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    {match.tournament.name} • {match.tournament.season}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '40%' }}>
                      <Avatar 
                        src={match.homeTeam.logoUrl} 
                        alt={match.homeTeam.name}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {match.homeTeam.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                      {match.scoreHome !== null && match.scoreAway !== null ? (
                        <Typography variant="body1" fontWeight="bold">
                          {match.scoreHome} - {match.scoreAway}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {match.matchDate && format(parseISO(match.matchDate), 'h:mm a')}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '40%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', textAlign: 'right' }}>
                        {match.awayTeam.name}
                      </Typography>
                      <Avatar 
                        src={match.awayTeam.logoUrl} 
                        alt={match.awayTeam.name}
                        sx={{ width: 32, height: 32, ml: 1 }}
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      component={RouterLink}
                      to={`/teams/${match.homeTeam.id}`}
                      size="small"
                      sx={{ minWidth: 0 }}
                    >
                      Home Team
                    </Button>
                    <Button 
                      component={RouterLink}
                      to={`/teams/${match.awayTeam.id}`}
                      size="small"
                      sx={{ minWidth: 0 }}
                    >
                      Away Team
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        // Desktop/Tablet view: Display as table
        <TableContainer component={Paper} elevation={2}>
          <Table aria-label="matches table">
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Tournament</TableCell>
                <TableCell sx={{ color: 'white' }}>Home Team</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>Score</TableCell>
                <TableCell sx={{ color: 'white' }}>Away Team</TableCell>
                <TableCell align="center" sx={{ color: 'white' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentPageMatches().map(match => {
                const status = getMatchStatus(match);
                
                return (
                  <TableRow 
                    key={match.id}
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {match.matchDate && format(parseISO(match.matchDate), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.matchDate && format(parseISO(match.matchDate), 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {match.tournament.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.tournament.season}
                      </Typography>
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
                        <Avatar 
                          src={match.homeTeam.logoUrl} 
                          alt={match.homeTeam.name}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Box>
                          <Typography variant="body2">
                            {match.homeTeam.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {match.homeTeam.country}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {match.scoreHome !== null && match.scoreAway !== null ? (
                        <Typography variant="body1" fontWeight="bold">
                          {match.scoreHome} - {match.scoreAway}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          vs
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
                        <Avatar 
                          src={match.awayTeam.logoUrl} 
                          alt={match.awayTeam.name}
                          sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Box>
                          <Typography variant="body2">
                            {match.awayTeam.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {match.awayTeam.country}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" my={4}>
          <Pagination 
            count={totalPages} 
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
}

export default MatchesPage;