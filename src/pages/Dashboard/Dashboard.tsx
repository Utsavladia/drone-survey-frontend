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
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Dashboard</Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Battery Status */}
          <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '40vh'
          }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <Typography variant="h6">Battery Status</Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              overflow: 'auto',
              flex: 1
            }}>
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
            </Box>
          </Paper>

          {/* Available Drones List */}
          <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: 'calc(60vh - 24px)'
          }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <Typography variant="h6">Available Drones</Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              overflow: 'auto',
              flex: 1
            }}>
              <Stack spacing={2}>
                {drones
                  .filter(drone => drone.status === 'available')
                  .map((drone) => (
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
            </Box>
          </Paper>
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Stats Overview */}
          <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '20vh',
            minHeight: '150px'
          }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <Typography variant="h6">Fleet Overview</Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              overflow: 'auto',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stack direction="row" spacing={4} justifyContent="space-between" sx={{ width: '100%' }}>
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
            </Box>
          </Paper>

          {/* Running Missions */}
          <Paper sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: 'calc(80vh - 24px)'
          }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <Typography variant="h6">Running Missions</Typography>
            </Box>
            <Box sx={{ 
              p: 2, 
              overflow: 'auto',
              flex: 1
            }}>
              <RunningMissions />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 