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
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Map from '../Map/Map';
import { IMissionRun } from '../../types/missionRun';
import { socketService } from '../../services/socketService';
import './MissionRunDetailsModal.css';
import { DroneLocation } from '../../services/socketService';
import { getTimeAgo } from '../../utils/timeUtils';

interface MissionRunDetailsModalProps {
  missionRun: IMissionRun;
  open: boolean;
  onClose: () => void;
  currentLocation?: DroneLocation;
}

export const MissionRunDetailsModal: React.FC<MissionRunDetailsModalProps> = ({
  missionRun,
  open,
  onClose,
  currentLocation,
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
            batteryLevel: location.batteryLevel,
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
      <DialogTitle className="border-b border-green-200 bg-green-50">
        <div className="flex items-center justify-between">
          <Typography variant="h6" className="font-bold text-gray-900">
            Mission Run Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent className="bg-green-50">
        <Box className="flex flex-col gap-6 p-4 md:flex-row">
          {/* Left side - Map */}
          <Box className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[480px]">
              <Map
                waypoints={missionRun.missionSnapshot.flightPath}
                onWaypointAdd={() => {}}
                onWaypointRemove={() => {}}
                isMissionActive={true}
                currentLocation={droneLocation ? {
                  latitude: droneLocation.latitude,
                  longitude: droneLocation.longitude,
                  batteryLevel: droneLocation.batteryLevel,
                } : undefined}
              />
            </div>
          </Box>

          {/* Right side - Details */}
          <Box className="flex-1 space-y-6">
            {/* Mission Information */}
            <div className="flex justify-between p-4 bg-white rounded-lg shadow-md">
              <div>
                <Typography variant="h6" className="mb-4 font-bold text-gray-900">
                  Mission Information
                </Typography>
                <p className="mb-4 text-xl font-medium text-gray-900">
                {missionRun.missionSnapshot.name}
              </p>
              </div>
              <div className="flex flex-col items-end space-y-3">
                <div className="flex items-center justify-between">
                  <Chip
                    label={missionRun.status}
                    color="success"
                    size="small"
                    className="capitalize"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body2" className="text-gray-900">
                    {getTimeAgo(missionRun.started_at)}
                  </Typography>
                </div>
                {missionRun.completed_at && (
                  <div className="flex items-center justify-between">
                    <Typography variant="subtitle2" className="text-gray-600">Completed:</Typography>
                    <Typography variant="body2" className="text-gray-900">
                      {getTimeAgo(missionRun.completed_at)}
                    </Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Drone Information */}
            <div className="flex justify-between px-4 py-6 bg-white rounded-lg shadow-md">
                <div className="flex flex-col gap-2">
                  <Typography variant="h6" className="mb-4 font-bold text-gray-900">
                    Drone Information
                  </Typography>
                  <div className="flex items-center">
                    <img src="/drone1.png" alt="Drone" className="w-8 h-8 mr-2" />
                    <div>
                      <Typography variant="subtitle2" className="text-gray-600">Drone Name</Typography>
                      <Typography variant="body2" className="text-gray-900">
                        {missionRun.drone_id.name}
                      </Typography>
                    </div>
                  </div>
                </div>
                {droneLocation && (
                  <div className="flex flex-col items-center justify-end gap-2">
                    <Typography variant="h4" className="font-bold text-gray-900">
                      {Math.round(droneLocation.batteryLevel)}%
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Battery
                    </Typography>
                  </div>
                )}
            </div>

            {/* Mission Parameters */}
            <div className="p-4 bg-white rounded-lg shadow-md">
              <Typography variant="h6" className="mb-4 font-bold text-gray-900">
                Mission Parameters
              </Typography>
              <div className="space-y-3">
                
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle2" className="text-gray-600">Altitude:</Typography>
                  <Typography variant="body2" className="text-gray-900">
                    {missionRun.missionSnapshot.parameters.altitude} m
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle2" className="text-gray-600">Overlap:</Typography>
                  <Typography variant="body2" className="text-gray-900">
                    {missionRun.missionSnapshot.parameters.overlap}%
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle2" className="text-gray-600">Pattern:</Typography>
                  <Typography variant="body2" className="text-gray-900">
                    {missionRun.missionSnapshot.pattern}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle2" className="text-gray-600">Site:</Typography>
                  <Typography variant="body2" className="text-gray-900">
                    {missionRun.missionSnapshot.site}
                  </Typography>
                </div>
              </div>
            </div>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="p-4 border-t border-green-200 bg-green-50">
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          className="bg-green-600 hover:bg-green-700"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 