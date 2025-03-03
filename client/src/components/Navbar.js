import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  useMediaQuery, 
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
  Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home as HomeIcon, 
  EmojiEvents as TrophyIcon, 
  SportsSoccer as SoccerIcon, 
  People as PeopleIcon,
  GridView as DashboardIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Define navigation items
  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Tournaments', icon: <TrophyIcon />, path: '/tournaments' },
    { text: 'Teams', icon: <PeopleIcon />, path: '/teams' },
    { text: 'Matches', icon: <SoccerIcon />, path: '/matches' }
  ];

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    if (pathnames.length === 0) return null;

    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 2, mb: 3 }}>
        <MuiLink 
          component={RouterLink} 
          to="/"
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </MuiLink>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Convert path segments to readable titles
          let name = value.charAt(0).toUpperCase() + value.slice(1);
          
          // Handle special cases
          if (value === 'standings' && pathnames[index-1] === 'tournaments') {
            name = 'Standings';
          }
          
          // If ID, try to make it more readable
          if (!isNaN(value)) {
            name = pathnames[index-1] === 'tournaments' ? 'Tournament' : 'Team';
          }

          return last ? (
            <Typography color="text.primary" key={to}>
              {name}
            </Typography>
          ) : (
            <MuiLink
              component={RouterLink}
              underline="hover"
              color="inherit"
              to={to}
              key={to}
            >
              {name}
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    );
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SoccerIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          CL Explorer
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            component={RouterLink} 
            to={item.path} 
            key={item.text}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary" elevation={3}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for all screens */}
            <SoccerIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'white',
                textDecoration: 'none',
                flexGrow: { xs: 1, md: 0 }
              }}
            >
              CHAMPIONS LEAGUE
            </Typography>

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Desktop navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center',
                      mx: 1,
                      borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* User area - can be enhanced later */}
            {!isMobile && (
              <Box sx={{ flexGrow: 0 }}>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<DashboardIcon />}
                >
                  Dashboard
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Breadcrumbs container */}
      <Container maxWidth="lg">
        {generateBreadcrumbs()}
      </Container>
    </>
  );
}

export default Navbar;