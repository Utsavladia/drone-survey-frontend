import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Stack,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  BatteryFull,
  BatteryAlert,
  BatteryChargingFull,
  FlightTakeoff,
  FlightLand,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import { fetchDrones, updateDrone } from '../../store/slices/droneSlice';
import { socketService } from '../../services/socket';
import { Drone } from '../../types';
import RunningMissions from '../../components/RunningMissions/RunningMissions';

const getBatteryIcon = (level: number) => {
  if (level > 75) return <BatteryFull color="success" />;
  if (level > 25) return <BatteryAlert color="warning" />;
  return <BatteryChargingFull color="error" />;
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { drones, loading, error } = useSelector((state: RootState) => state.drones);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  const addDebugMessage = (message: string) => {
    setDebugMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    console.log('Initial fetch of drones');
    dispatch(fetchDrones());
  }, [dispatch]);

  useEffect(() => {
    console.log('Setting up socket connection');
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      addDebugMessage('Socket connected');
      setSocketStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      addDebugMessage('Socket disconnected');
      setSocketStatus('disconnected');
    });

    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
      addDebugMessage(`Socket error: ${error.message}`);
    });

    const handleDroneUpdate = (drone: Drone) => {
      console.log('Received drone update:', drone);
      addDebugMessage(`Received update for drone: ${drone.name}`);
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Update the drone in the Redux store
      dispatch(updateDrone(drone));
    };

    socketService.subscribeToDroneUpdates(handleDroneUpdate);
    addDebugMessage('Subscribed to drone updates');

    const handleDroneStatus = (data: { droneId: string; status: string }) => {
      dispatch({ type: 'drones/updateDroneStatus', payload: data });
      addDebugMessage(`Drone ${data.droneId} status updated to ${data.status}`);
    };
    socketService.subscribeToDroneStatus(handleDroneStatus);
    addDebugMessage('Subscribed to drone status updates');

    return () => {
      console.log('Cleaning up socket connection');
      socketService.unsubscribeFromDroneUpdates(handleDroneUpdate);
      socketService.unsubscribeFromDroneStatus(handleDroneStatus);
      socketService.disconnect();
      addDebugMessage('Socket connection cleaned up');
    };
  }, [dispatch]);

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

  const totalDrones = drones.length;
  const activeDrones = drones.filter(drone => drone.status === 'available').length;
  const maintenanceDrones = drones.filter(drone => drone.status === 'maintenance').length;
  const lowBatteryDrones = drones.filter(drone => drone.batteryLevel < 20).length;
  const averageBatteryLevel = drones.reduce((acc, drone) => acc + drone.batteryLevel, 0) / drones.length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Dashboard</Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1 }}>
          {/* Stats Overview */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Fleet Overview</Typography>
            <Stack direction="row" spacing={4} justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Drones</Typography>
                <Typography variant="h4">{totalDrones}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Active Drones</Typography>
                <Typography variant="h4">{activeDrones}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">In Maintenance</Typography>
                <Typography variant="h4">{maintenanceDrones}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Low Battery</Typography>
                <Typography variant="h4">{lowBatteryDrones}</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Available Drones List */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Available Drones</Typography>
            <Stack spacing={2}>
              {drones.map((drone) => (
                <Box key={drone._id} sx={{ 
                  p: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">{drone.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {drone.droneModel} • {drone.status}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getBatteryIcon(drone.batteryLevel)}
                      <Typography variant="body2">{drone.batteryLevel}%</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1 }}>
          {/* Battery Status */}
          <Paper sx={{ p: 2, mb: 3, height: '33vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Battery Status</Typography>
            <Stack spacing={2}>
              {drones.map((drone) => (
                <Box key={drone._id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2">{drone.name}</Typography>
                    <Typography variant="body2">{drone.batteryLevel}%</Typography>
                  </Stack>
                  <Box sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      width: `${drone.batteryLevel}%`, 
                      height: '100%', 
                      bgcolor: drone.batteryLevel < 20 ? 'error.main' : 
                              drone.batteryLevel < 50 ? 'warning.main' : 'success.main'
                    }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Running Missions */}
          <Paper sx={{ p: 2, height: 'calc(50vh - 24px)', overflow: 'auto' }}>
            <RunningMissions />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 