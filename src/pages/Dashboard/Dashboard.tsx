import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Stack,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { AppDispatch, RootState } from '../../store';
import { fetchDrones } from '../../store/slices/droneSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { drones, loading, error } = useSelector((state: RootState) => state.drones);

  useEffect(() => {
    dispatch(fetchDrones());
  }, [dispatch]);

  const getStatusCount = (status: string) => {
    return drones.filter(drone => drone.status === status).length;
  };

  const getLowBatteryDrones = () => {
    return drones.filter(drone => drone.batteryLevel < 30);
  };

  const stats = [
    {
      title: 'Total Drones',
      value: drones.length,
      color: '#1976d2',
    },
    {
      title: 'Available',
      value: getStatusCount('available'),
      color: '#2e7d32',
    },
    {
      title: 'In Mission',
      value: getStatusCount('in-mission'),
      color: '#ed6c02',
    },
    {
      title: 'Maintenance',
      value: getStatusCount('maintenance'),
      color: '#d32f2f',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        {stats.map((stat) => (
          <Box
            key={stat.title}
            sx={{
              width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
            }}
          >
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: stat.color,
                color: 'white',
              }}
            >
              <Typography component="h2" variant="h6" gutterBottom>
                {stat.title}
              </Typography>
              <Typography component="p" variant="h4">
                {stat.value}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
        <Box sx={{ width: '50%' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Battery Drones
            </Typography>
            <List>
              {getLowBatteryDrones().map((drone) => (
                <React.Fragment key={drone._id}>
                  <ListItem>
                    <ListItemText
                      primary={drone.name}
                      secondary={`Battery: ${drone.batteryLevel}%`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {getLowBatteryDrones().length === 0 && (
                <ListItem>
                  <ListItemText primary="No drones with low battery" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>

        <Box sx={{ width: '50%' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {drones.slice(0, 5).map((drone) => (
                <React.Fragment key={drone._id}>
                  <ListItem>
                    <ListItemText
                      primary={drone.name}
                      secondary={`Last active: ${new Date(drone.lastActive).toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default Dashboard; 