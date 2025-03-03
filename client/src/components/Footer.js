import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Link, 
  Divider,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  SportsSoccer as SoccerIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'primary.dark',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and App Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SoccerIcon sx={{ mr: 1, fontSize: 30 }} />
              <Typography variant="h6" component="div" fontWeight="bold">
                Champions League Explorer
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your ultimate guide to UEFA Champions League football - teams, matches, standings, and statistics for Europe's premier football competition.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'white' }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'white' }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'white' }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'white' }}>
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ p: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/" color="inherit" underline="hover">
                  Home
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/tournaments" color="inherit" underline="hover">
                  Tournaments
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/teams" color="inherit" underline="hover">
                  Teams
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/matches" color="inherit" underline="hover">
                  Matches
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Resources
            </Typography>
            <Box component="ul" sx={{ p: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover">
                  API Docs
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover">
                  FAQ
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover">
                  Support
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="#" color="inherit" underline="hover">
                  Privacy Policy
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" paragraph>
              Have questions or suggestions? We'd love to hear from you!
            </Typography>
            <Typography variant="body2">
              Email: info@championsleagueexplorer.com
            </Typography>
            <Typography variant="body2">
              Phone: +1 (555) 123-4567
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'flex-start',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <Typography variant="body2" sx={{ mb: isMobile ? 1 : 0 }}>
            &copy; {new Date().getFullYear()} Champions League Explorer. All rights reserved.
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            Data provided by API-Football
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;