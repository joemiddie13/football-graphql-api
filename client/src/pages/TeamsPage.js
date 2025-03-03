import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, gql } from '@apollo/client';
import { 
  Typography, Box, CircularProgress, Alert, Card, CardContent, 
  CardActionArea, Grid, Container, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Pagination,
  Chip, Avatar, useMediaQuery, useTheme, Divider,
  Paper, IconButton, Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  People as PeopleIcon,
  SportsSoccer as SoccerIcon,
  Public as GlobeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// GraphQL query for teams with pagination
const GET_TEAMS = gql`
  query GetTeams($after: String, $first: Int, $countryFilter: String, $nameFilter: String) {
    teamsConnection(
      first: $first, 
      after: $after,
      country: $countryFilter,
      nameContains: $nameFilter
    ) {
      edges {
        node {
          id
          name
          country
          logoUrl
          founded
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

// GraphQL query to get unique countries for the filter
const GET_COUNTRIES = gql`
  query GetUniqueCountries {
    teams {
      country
    }
  }
`;

function TeamsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term to avoid too many requests
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // GraphQL query with variables
  const { loading, error, data, fetchMore, refetch } = useQuery(GET_TEAMS, {
    variables: {
      first: itemsPerPage,
      countryFilter: countryFilter || null,
      nameFilter: debouncedSearchTerm || null
    },
    fetchPolicy: 'cache-and-network', // Use cache but update in background
  });

  // Get unique countries for the filter dropdown
  const { data: countriesData } = useQuery(GET_COUNTRIES);
  
  // Extract unique countries from the data
  const uniqueCountries = countriesData?.teams 
    ? [...new Set(countriesData.teams.map(team => team.country))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)) 
    : [];

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // We don't reset page here, it will happen when debouncedSearchTerm changes
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, countryFilter]);

  // Handle country filter change
  const handleCountryFilterChange = (event) => {
    setCountryFilter(event.target.value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    
    // If we already have the data for this page, no need to fetch more
    if (data?.teamsConnection?.edges?.length >= value * itemsPerPage) {
      return;
    }
    
    // Otherwise, fetch more data
    fetchMore({
      variables: {
        after: data?.teamsConnection?.pageInfo?.endCursor,
        first: itemsPerPage
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          teamsConnection: {
            __typename: 'TeamConnection',
            edges: [
              ...prev.teamsConnection.edges,
              ...fetchMoreResult.teamsConnection.edges
            ],
            pageInfo: fetchMoreResult.teamsConnection.pageInfo,
            totalCount: fetchMoreResult.teamsConnection.totalCount
          }
        };
      }
    });
  };

  // Get the teams for the current page
  const getCurrentPageTeams = () => {
    if (!data?.teamsConnection?.edges) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.teamsConnection.edges
      .slice(startIndex, startIndex + itemsPerPage)
      .map(edge => edge.node);
  };

  // Calculate total pages
  const totalPages = data?.teamsConnection?.totalCount 
    ? Math.ceil(data.teamsConnection.totalCount / itemsPerPage) 
    : 0;

  // Function to get placeholder if logo URL is not valid
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

  // Render loading state
  if (loading && !data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Teams
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
          Teams
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
          <Typography variant="subtitle1">Error loading teams</Typography>
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
          <PeopleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4">
            Teams
          </Typography>
        </Box>

        {loading && data && (
          <CircularProgress size={24} />
        )}
      </Box>

      {/* Search and Filter Controls */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Teams"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Country</InputLabel>
              <Select
                value={countryFilter}
                label="Filter by Country"
                onChange={handleCountryFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <GlobeIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Countries</MenuItem>
                {uniqueCountries.map(country => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Showing {data?.teamsConnection?.edges?.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {
            Math.min(currentPage * itemsPerPage, data?.teamsConnection?.totalCount || 0)
          } of {data?.teamsConnection?.totalCount || 0} teams
        </Typography>
        
        <Tooltip title="Refresh teams data">
          <IconButton size="small" onClick={() => refetch()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Teams Grid */}
      {getCurrentPageTeams().length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No teams found matching your search criteria.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {getCurrentPageTeams().map(team => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardActionArea 
                  component={RouterLink} 
                  to={`/teams/${team.id}`}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    height: '100%'
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      backgroundColor: theme.palette.grey[50]
                    }}
                  >
                    <Avatar 
                      src={team.logoUrl} 
                      alt={team.name}
                      sx={{ 
                        width: 100, 
                        height: 100,
                        mb: 2,
                        bgcolor: getAvatarBgColor(team.name)
                      }}
                    >
                      {getTeamInitials(team.name)}
                    </Avatar>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      align="center" 
                      gutterBottom
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {team.name}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box display="flex" flexDirection="column" gap={1} alignItems="center">
                      <Chip 
                        icon={<GlobeIcon />} 
                        label={team.country} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      
                      {team.founded && (
                        <Typography variant="body2" color="text.secondary">
                          Founded: {team.founded}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
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

export default TeamsPage;