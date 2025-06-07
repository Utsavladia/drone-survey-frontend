import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Typography variant="h6" sx={{ p: 2 }}>
        Drone Survey
      </Typography>
      <List>
        <ListItem component={RouterLink} to="/">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem component={RouterLink} to="/drones">
          <ListItemIcon><DronesIcon /></ListItemIcon>
          <ListItemText primary="Drones" />
        </ListItem>
        <ListItem component={RouterLink} to="/missions">
          <ListItemIcon><FlightIcon /></ListItemIcon>
          <ListItemText primary="Mission Planning" />
        </ListItem>
        <ListItem component={RouterLink} to="/reports">
          <ListItemIcon><AssessmentIcon /></ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Navigation; 