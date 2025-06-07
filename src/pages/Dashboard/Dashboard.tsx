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
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Chip 
          label={`Socket: ${socketStatus}`}
          color={socketStatus === 'connected' ? 'success' : 'error'}
        />
        {lastUpdate && (
          <Chip 
            label={`Last Update: ${lastUpdate}`}
            color="primary"
          />
        )}
      </Stack>

      {/* Debug Messages */}
      <Paper sx={{ p: 2, mb: 3, maxHeight: '200px', overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>Debug Messages</Typography>
        <Stack spacing={1}>
          {debugMessages.map((msg, index) => (
            <Typography key={index} variant="body2" color="textSecondary">
              {msg}
            </Typography>
          ))}
        </Stack>
      </Paper>

      <Stack spacing={3}>
        {/* Fleet Overview */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Fleet Overview</Typography>
          <Stack direction="row" spacing={2}>
            <Box>
              <Typography variant="subtitle2">Total Drones</Typography>
              <Typography variant="h4">{totalDrones}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Active Drones</Typography>
              <Typography variant="h4">{activeDrones}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">In Maintenance</Typography>
              <Typography variant="h4">{maintenanceDrones}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">Low Battery</Typography>
              <Typography variant="h4">{lowBatteryDrones}</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Battery Status */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Battery Status</Typography>
          <Stack spacing={1}>
            {drones.map((drone) => (
              <Box key={drone._id}>
                <Typography variant="subtitle2">{drone.name}</Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 20, 
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: `${drone.batteryLevel}%`, 
                    height: '100%', 
                    bgcolor: drone.batteryLevel < 20 ? 'error.main' : 'success.main'
                  }} />
                </Box>
                <Typography variant="caption">{drone.batteryLevel}%</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default Dashboard; 