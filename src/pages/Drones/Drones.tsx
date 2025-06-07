import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { BatteryFull, BatteryAlert, BatteryChargingFull } from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store';
import { fetchDrones } from '../../store/slices/droneSlice';
import { Drone } from '../../types';
import DroneDialog from '../../components/DroneDialog/DroneDialog';
import { droneApi } from '../../services/api';

const getStatusColor = (status: Drone['status']) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'in-mission':
      return 'primary';
    case 'charging':
      return 'warning';
    case 'maintenance':
      return 'error';
    default:
      return 'default';
  }
};

const getBatteryIcon = (level: number) => {
  if (level > 75) return <BatteryFull />;
  if (level > 25) return <BatteryAlert />;
  return <BatteryChargingFull />;
};

const Drones: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { drones, loading, error } = useSelector((state: RootState) => state.drones);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | undefined>();

  useEffect(() => {
    console.log('Fetching drones...');
    dispatch(fetchDrones())
      .unwrap()
      .then((data) => {
        console.log('Drones fetched successfully:', data);
      })
      .catch((error) => {
        console.error('Error fetching drones:', error);
      });
  }, [dispatch]);

  const handleAddDrone = () => {
    setSelectedDrone(undefined);
    setDialogOpen(true);
  };

  const handleEditDrone = (drone: Drone) => {
    setSelectedDrone(drone);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDrone(undefined);
  };

  const handleDialogSubmit = async (droneData: Partial<Drone>) => {
    try {
      if (selectedDrone) {
        await droneApi.update(selectedDrone._id, droneData);
      } else {
        await droneApi.create(droneData);
      }
      dispatch(fetchDrones());
    } catch (error) {
      console.error('Failed to save drone:', error);
    }
  };

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Drone Fleet</Typography>
        <Button variant="contained" color="primary" onClick={handleAddDrone}>
          Add New Drone
        </Button>
      </Box>

      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        {drones.map((drone) => (
          <Box key={drone._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' } }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{drone.name}</Typography>
                  <Chip
                    label={drone.status}
                    color={getStatusColor(drone.status) as any}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Model: {drone.droneModel}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getBatteryIcon(drone.batteryLevel)}
                  <Typography variant="body2">
                    Battery: {drone.batteryLevel}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Last Active: {new Date(drone.lastActive).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => handleEditDrone(drone)}>
                  Edit
                </Button>
                {drone.status === 'available' && (
                  <Button size="small" color="primary">
                    Start Mission
                  </Button>
                )}
              </CardActions>
            </Card>
          </Box>
        ))}
      </Stack>

      <DroneDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        drone={selectedDrone}
      />
    </Box>
  );
};

export default Drones; 