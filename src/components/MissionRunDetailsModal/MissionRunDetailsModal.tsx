import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Map from '../Map/Map';
import { IMissionRun } from '../../types/missionRun';
import { socketService } from '../../services/socketService';
import './MissionRunDetailsModal.css';

interface MissionRunDetailsModalProps {
  missionRun: IMissionRun;
  open: boolean;
  onClose: () => void;
}

interface DroneLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

export const MissionRunDetailsModal: React.FC<MissionRunDetailsModalProps> = ({
  missionRun,
  open,
  onClose,
}) => {
  const [droneLocation, setDroneLocation] = useState<DroneLocation | null>(null);

  useEffect(() => {
    if (open && missionRun._id) {
      console.log('MissionRunDetailsModal: Opening modal for mission:', missionRun._id);
      
      // Subscribe to mission updates
      const unsubscribe = socketService.subscribeToMission(missionRun._id, (location) => {
        console.log('MissionRunDetailsModal: Received location update:', {
          missionId: missionRun._id,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        });
        setDroneLocation(location);
      });

      // Cleanup subscription on unmount
      return () => {
        console.log('MissionRunDetailsModal: Cleaning up subscription for mission:', missionRun._id);
        unsubscribe?.();
      };
    }
  }, [open, missionRun._id]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className="mission-run-details-modal"
    >
      <DialogTitle>
        Mission Run Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: { md: '1' } }}>
            <Box className="map-container">
              <Map
                waypoints={missionRun.missionSnapshot.flightPath}
                onWaypointAdd={() => {}}
                onWaypointRemove={() => {}}
                isMissionActive={true}
                currentLocation={droneLocation ? {
                  latitude: droneLocation.latitude,
                  longitude: droneLocation.longitude,
                } : undefined}
              />
            </Box>
          </Box>
          <Box sx={{ flex: { md: '1' } }}>
            <Box className="details-container">
              <Box className="detail-section">
                <Typography variant="h6">Mission Information</Typography>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Run ID:</Typography>
                  <Typography>{missionRun._id}</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Status:</Typography>
                  <Typography className={`status-${missionRun.status.toLowerCase()}`}>
                    {missionRun.status}
                  </Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Start Time:</Typography>
                  <Typography>{new Date(missionRun.started_at).toLocaleString()}</Typography>
                </Box>
                {missionRun.completed_at && (
                  <Box className="detail-item">
                    <Typography variant="subtitle2">Completion Time:</Typography>
                    <Typography>{new Date(missionRun.completed_at).toLocaleString()}</Typography>
                  </Box>
                )}
              </Box>

              <Box className="detail-section">
                <Typography variant="h6">Drone Information</Typography>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Drone Name:</Typography>
                  <Typography>{missionRun.drone_id.name}</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Drone Status:</Typography>
                  <Typography>{missionRun.drone_id.status}</Typography>
                </Box>
                {/* {droneLocation && (
                  <>
                    <Box className="detail-item">
                      <Typography variant="subtitle2">Current Altitude:</Typography>
                      <Typography>{droneLocation.altitude.toFixed(2)} m</Typography>
                    </Box>
                    <Box className="detail-item">
                      <Typography variant="subtitle2">Current Speed:</Typography>
                      <Typography>{droneLocation.speed.toFixed(2)} m/s</Typography>
                    </Box>
                    <Box className="detail-item">
                      <Typography variant="subtitle2">Current Heading:</Typography>
                      <Typography>{droneLocation.heading.toFixed(2)}°</Typography>
                    </Box>
                  </>
                )} */}
              </Box>

              <Box className="detail-section">
                <Typography variant="h6">Mission Parameters</Typography>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Pattern:</Typography>
                  <Typography>{missionRun.missionSnapshot.pattern}</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Altitude:</Typography>
                  <Typography>{missionRun.missionSnapshot.parameters.altitude} m</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="subtitle2">Overlap:</Typography>
                  <Typography>{missionRun.missionSnapshot.parameters.overlap}%</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 