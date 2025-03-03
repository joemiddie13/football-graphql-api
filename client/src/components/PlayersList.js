import React, { useState } from 'react';
import { 
  Typography, Box, Alert, Paper, Divider, Card, CardContent, 
  Grid, Chip, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, FormControl, InputLabel, Select, 
  MenuItem, TextField, InputAdornment, useMediaQuery, useTheme, Tabs, Tab
} from '@mui/material';
import { 
  Search as SearchIcon,
  People as PeopleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

function PlayersList({ players }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for player filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter and sort players
  const getFilteredAndSortedPlayers = () => {
    if (!players || players.length === 0) return [];
    
    let filtered = [...players];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.nationality && player.nationality.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply position filter
    if (positionFilter !== 'All') {
      filtered = filtered.filter(player => player.position === positionFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'jerseyNumber') {
        // Handle null/undefined jersey numbers
        if (a.jerseyNumber === null || a.jerseyNumber === undefined) return 1;
        if (b.jerseyNumber === null || b.jerseyNumber === undefined) return -1;
        comparison = a.jerseyNumber - b.jerseyNumber;
      } else if (sortBy === 'age') {
        // Handle null/undefined ages
        if (a.age === null || a.age === undefined) return 1;
        if (b.age === null || b.age === undefined) return -1;
        comparison = a.age - b.age;
      } else if (sortBy === 'goals') {
        comparison = a.goals - b.goals;
      } else if (sortBy === 'assists') {
        comparison = a.assists - b.assists;
      } else if (sortBy === 'appearances') {
        comparison = a.appearances - b.appearances;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Render filter controls
  const renderFilterControls = () => (
    <Box mb={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            label="Search Players"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Position</InputLabel>
            <Select
              value={positionFilter}
              label="Position"
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <MenuItem value="All">All Positions</MenuItem>
              <MenuItem value="Goalkeeper">Goalkeepers</MenuItem>
              <MenuItem value="Defender">Defenders</MenuItem>
              <MenuItem value="Midfielder">Midfielders</MenuItem>
              <MenuItem value="Forward">Forwards</MenuItem>
              {players.some(p => p.position === 'Unknown') && (
                <MenuItem value="Unknown">Other</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="jerseyNumber">Jersey Number</MenuItem>
              <MenuItem value="age">Age</MenuItem>
              <MenuItem value="goals">Goals</MenuItem>
              <MenuItem value="assists">Assists</MenuItem>
              <MenuItem value="appearances">Appearances</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Box 
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1, 
              p: 1,
              cursor: 'pointer'
            }}
          >
            {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  // Render players table for desktop/tablet
  const renderPlayersTable = (players) => {
    if (!players || players.length === 0) {
      return (
        <Alert severity="info">
          No players found matching your filters.
        </Alert>
      );
    }

    return (
      <TableContainer component={Paper} elevation={2}>
        <Table size={isTablet ? "small" : "medium"}>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>No.</TableCell>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Position</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Age</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Nationality</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Apps</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Goals</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Assists</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id} hover>
                <TableCell>{player.jerseyNumber || '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {player.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={player.position} 
                    size="small"
                    color={
                      player.position === 'Goalkeeper' ? 'secondary' :
                      player.position === 'Defender' ? 'success' :
                      player.position === 'Midfielder' ? 'primary' :
                      player.position === 'Forward' ? 'error' : 'default'
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">{player.age || '-'}</TableCell>
                <TableCell align="center">{player.nationality || '-'}</TableCell>
                <TableCell align="center">{player.appearances}</TableCell>
                <TableCell align="center">{player.goals}</TableCell>
                <TableCell align="center">{player.assists}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render player cards for mobile
  const renderPlayerCards = (players) => {
    if (!players || players.length === 0) {
      return (
        <Alert severity="info">
          No players found matching your filters.
        </Alert>
      );
    }

    return (
      <Grid container spacing={2}>
        {players.map(player => (
          <Grid item xs={12} key={player.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center">
                    {player.jerseyNumber && (
                      <Chip 
                        label={`#${player.jerseyNumber}`} 
                        size="small" 
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                    )}
                    <Typography variant="body1" fontWeight="bold">
                      {player.name}
                    </Typography>
                  </Box>
                  <Chip 
                    label={player.position} 
                    size="small"
                    color={
                      player.position === 'Goalkeeper' ? 'secondary' :
                      player.position === 'Defender' ? 'success' :
                      player.position === 'Midfielder' ? 'primary' :
                      player.position === 'Forward' ? 'error' : 'default'
                    }
                  />
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Age: {player.age || '-'}</Typography>
                  <Typography variant="body2">{player.nationality || '-'}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Chip size="small" label={`Apps: ${player.appearances}`} />
                  <Chip size="small" label={`Goals: ${player.goals}`} />
                  <Chip size="small" label={`Assists: ${player.assists}`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <PeopleIcon sx={{ mr: 1 }} /> Team Squad
      </Typography>
      
      {players && players.length > 0 ? (
        <>
          {renderFilterControls()}
          
          <Box mt={3}>
            <Tabs 
              value={positionFilter}
              onChange={(e, newValue) => setPositionFilter(newValue)}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
            >
              <Tab label="All" value="All" />
              <Tab label="Goalkeepers" value="Goalkeeper" />
              <Tab label="Defenders" value="Defender" />
              <Tab label="Midfielders" value="Midfielder" />
              <Tab label="Forwards" value="Forward" />
              {players.some(p => p.position === 'Unknown') && (
                <Tab label="Other" value="Unknown" />
              )}
            </Tabs>
          </Box>
          
          <Box mt={2}>
            {isMobile ? 
              renderPlayerCards(getFilteredAndSortedPlayers()) : 
              renderPlayersTable(getFilteredAndSortedPlayers())
            }
          </Box>
        </>
      ) : (
        <Alert severity="info">
          No player data available for this team.
        </Alert>
      )}
    </Box>
  );
}

export default PlayersList;