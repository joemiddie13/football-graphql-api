import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
  Typography, Box, CircularProgress, Alert, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material';

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
  const { loading, error, data } = useQuery(TOURNAMENT_STANDINGS_QUERY, {
    variables: { tournamentId: id },
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

      <Typography variant="h5" gutterBottom>
        Standings
      </Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }} aria-label="tournament standings table">
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Pos</TableCell>
              <TableCell sx={{ color: 'white' }}>Team</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>MP</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>W</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>D</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>L</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>GF</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>GA</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>GD</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Pts</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.teamRankings.map((ranking, index) => (
              <TableRow
                key={ranking.team.id}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  backgroundColor: index % 2 === 0 ? 'action.hover' : 'inherit'
                }}
              >
                <TableCell component="th" scope="row">
                  {index + 1}
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
                    {ranking.team.logoUrl && (
                      <Box 
                        component="img"
                        src={ranking.team.logoUrl}
                        alt={ranking.team.name}
                        sx={{ height: 24, width: 24, mr: 1 }}
                      />
                    )}
                    <Box>
                      <Typography variant="body2" component="span">
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
                <TableCell align="center">{ranking.goalsFor}</TableCell>
                <TableCell align="center">{ranking.goalsAgainst}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={ranking.goalDifference > 0 ? `+${ranking.goalDifference}` : ranking.goalDifference} 
                    size="small"
                    color={ranking.goalDifference > 0 ? "success" : ranking.goalDifference < 0 ? "error" : "default"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="bold">
                    {ranking.points}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default TournamentStandings;