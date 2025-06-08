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

const Drones = () => {
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
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} borderBottom="1px solid #e0e0e0" pb={2}>
        <p className="text-2xl font-semibold text-gray-800">Drone Fleet</p>
        <Button variant="contained" color="primary" onClick={handleAddDrone}>
          Add New Drone
        </Button>
      </Box>

      <Box display="flex" gap={3}>
        {/* Available Drones */}
        <Box flex={1}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Available
          </Typography>
          <Stack spacing={2}>
            {drones
              .filter(drone => drone.status === 'available')
              .map((drone) => (
                <Card key={drone._id}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {drone.name}
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 2 }}>
                          Model: {drone.droneModel}
                        </Typography>
                      </Box>
                      <img 
                        src="/drone1.png"
                        alt="Drone" 
                        style={{ 
                          width: '80px', 
                          height: '80px',
                          objectFit: 'contain'
                        }} 
                      />
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end',
                      mt: 'auto'
                    }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getBatteryIcon(drone.batteryLevel)}
                        <Typography variant="h6" color="primary">
                          {drone.batteryLevel}%
                        </Typography>
                      </Box>
                      <Chip
                        label={drone.status}
                        color={getStatusColor(drone.status) as any}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditDrone(drone)}
                      sx={{ ml: 'auto' }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              ))}
          </Stack>
        </Box>

        {/* In Mission Drones */}
        <Box flex={1}>
          <Typography variant="h6" color="primary.main" gutterBottom>
            In Mission
          </Typography>
          <Stack spacing={2}>
            {drones
              .filter(drone => drone.status === 'in-mission')
              .map((drone) => (
                <Card key={drone._id}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {drone.name}
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 2 }}>
                          Model: {drone.droneModel}
                        </Typography>
                      </Box>
                      <img 
                        src="/mission.png"
                        alt="Drone" 
                        style={{ 
                          width: '50px', 
                          height: '50px',
                          objectFit: 'contain'
                        }} 
                      />
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end',
                      mt: 'auto'
                    }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getBatteryIcon(drone.batteryLevel)}
                        <Typography variant="h6" color="primary">
                          {drone.batteryLevel}%
                        </Typography>
                      </Box>
                      <Chip
                        label={drone.status}
                        color={getStatusColor(drone.status) as any}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditDrone(drone)}
                      sx={{ ml: 'auto' }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              ))}
          </Stack>
        </Box>

        {/* Charging & Maintenance Drones */}
        <Box flex={1}>
          <Typography variant="h6" color="warning.main" gutterBottom>
            Charging & Maintenance
          </Typography>
          <Stack spacing={2}>
            {drones
              .filter(drone => drone.status === 'charging' || drone.status === 'maintenance')
              .map((drone) => (
                <Card key={drone._id}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {drone.name}
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 2 }}>
                          Model: {drone.droneModel}
                        </Typography>
                      </Box>
                      <img 
                        src={drone.status === 'charging' ? "/charging.png" : "/maintenance.png"}
                        alt="Drone" 
                        style={{ 
                          width: '60px', 
                          height: '40px',
                          objectFit: 'contain'
                        }} 
                      />
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-end',
                      mt: 'auto'
                    }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getBatteryIcon(drone.batteryLevel)}
                        <Typography variant="h6" color="primary">
                          {drone.batteryLevel}%
                        </Typography>
                      </Box>
                      <Chip
                        label={drone.status}
                        color={getStatusColor(drone.status) as any}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEditDrone(drone)}
                      sx={{ ml: 'auto' }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              ))}
          </Stack>
        </Box>
      </Box>

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