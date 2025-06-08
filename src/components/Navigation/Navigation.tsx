import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlightIcon from '@mui/icons-material/Flight';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DronesIcon from '@mui/icons-material/SmartToy';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Typography variant="h6" sx={{ p: 2, color: 'primary.main', fontWeight: 'bold' }}>
        Drone Survey
      </Typography>
      <List>
        <ListItem 
          component={RouterLink} 
          to="/"
          sx={{
            backgroundColor: isActive('/') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            color: isActive('/') ? 'primary.main' : 'inherit',
            '&:hover': {
              backgroundColor: isActive('/') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
            },
            borderRight: isActive('/') ? '3px solid #1976d2' : 'none',
          }}
        >
          <ListItemIcon sx={{ color: isActive('/') ? 'primary.main' : 'inherit' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem 
          component={RouterLink} 
          to="/drones"
          sx={{
            backgroundColor: isActive('/drones') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            color: isActive('/drones') ? 'primary.main' : 'inherit',
            '&:hover': {
              backgroundColor: isActive('/drones') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
            },
            borderRight: isActive('/drones') ? '3px solid #1976d2' : 'none',
          }}
        >
          <ListItemIcon sx={{ color: isActive('/drones') ? 'primary.main' : 'inherit' }}>
            <DronesIcon />
          </ListItemIcon>
          <ListItemText primary="Drones" />
        </ListItem>

        <ListItem 
          component={RouterLink} 
          to="/missions"
          sx={{
            backgroundColor: isActive('/missions') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            color: isActive('/missions') ? 'primary.main' : 'inherit',
            '&:hover': {
              backgroundColor: isActive('/missions') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
            },
            borderRight: isActive('/missions') ? '3px solid #1976d2' : 'none',
          }}
        >
          <ListItemIcon sx={{ color: isActive('/missions') ? 'primary.main' : 'inherit' }}>
            <FlightIcon />
          </ListItemIcon>
          <ListItemText primary="Mission Planning" />
        </ListItem>

        <ListItem 
          component={RouterLink} 
          to="/reports"
          sx={{
            backgroundColor: isActive('/reports') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            color: isActive('/reports') ? 'primary.main' : 'inherit',
            '&:hover': {
              backgroundColor: isActive('/reports') ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
            },
            borderRight: isActive('/reports') ? '3px solid #1976d2' : 'none',
          }}
        >
          <ListItemIcon sx={{ color: isActive('/reports') ? 'primary.main' : 'inherit' }}>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Navigation; 