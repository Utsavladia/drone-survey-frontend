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
  Skeleton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
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

const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const MissionRunDetailsModal: React.FC<MissionRunDetailsModalProps> = ({
  missionRun,
  open,
  onClose,
  currentLocation,
}) => {
  const [droneLocation, setDroneLocation] = useState<DroneLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && missionRun._id) {
      setIsLoading(true);
      console.log('MissionRunDetailsModal: Opening modal for mission:', missionRun._id);
      
      // Subscribe to mission updates
      const unsubscribe = socketService.subscribeToMission(missionRun._id, (location) => {
        console.log('MissionRunDetailsModal: Received location update:', {
          missionId: missionRun._id,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            batteryLevel: location.batteryLevel,
            progress: location.progress,
            estimatedTimeRemaining: location.estimatedTimeRemaining
          }
        });
        setDroneLocation(location);
        setIsLoading(false);
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[540px]">
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
                <p className="mb-2 text-xl font-medium text-gray-900">
                  {missionRun.missionSnapshot.name}
                </p>
                <p className="text-sm font-medium text-gray-500 ">
                  {missionRun.missionSnapshot.description}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-3">
                <Chip
                  label={missionRun.status}
                  color="success"
                  size="small"
                  className="mb-2 capitalize"
                />
                <div className="flex flex-col items-end">
                  <Typography variant="body2" className="text-gray-600">
                    {getTimeAgo(missionRun.started_at)}
                  </Typography>
                  <Typography variant="body2" className="mt-1 text-gray-600">
                    {missionRun.missionSnapshot.site}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Progress Information */}
            {isLoading ? (
              <div className="p-4 bg-white rounded-lg shadow-md">
                <Typography variant="h6" className="mb-4 font-bold text-gray-900">
                  Progress
                </Typography>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <Skeleton variant="text" width={100} />
                      <Skeleton variant="text" width={40} />
                    </div>
                    <Skeleton variant="rectangular" height={8} className="rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton variant="text" width={150} />
                    <Skeleton variant="text" width={60} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg shadow-md">
                <Typography variant="h6" className="mb-4 font-bold text-gray-900">
                  Progress
                </Typography>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <Typography variant="body2" className="text-gray-600">
                        Mission Progress
                      </Typography>
                      <Typography variant="body2" className="font-medium text-gray-900">
                        {droneLocation?.progress || 0}%
                      </Typography>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 transition-all duration-500 bg-green-600 rounded-full"
                        style={{ width: `${droneLocation?.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-600">
                      Estimated Time Remaining
                    </Typography>
                    <Typography variant="body2" className="font-medium text-gray-900">
                      {formatTimeRemaining(droneLocation?.estimatedTimeRemaining || 0)}
                    </Typography>
                  </div>
                </div>
              </div>
            )}

            {/* Drone Information */}
            {isLoading ? (
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
                <div className="flex flex-col items-center justify-end gap-2">
                  <Skeleton variant="text" width={60} height={40} />
                  <Skeleton variant="text" width={50} />
                </div>
              </div>
            ) : (
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
            )}

            {/* Mission Parameters */}
            <div className="p-4 bg-white rounded-lg shadow-md">
              <Typography variant="h6" className="mb-4 font-bold text-gray-900">
                Mission Parameters
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle2" className="text-gray-600">Altitude:</Typography>
                  <Typography variant="body2" className="text-gray-900">
                    {missionRun.missionSnapshot.parameters.altitude} m
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="subtitle2" className="text-gray-600">Pattern:</Typography>
                  <Typography variant="body2" className="text-gray-900">
                    {missionRun.missionSnapshot.pattern}
                  </Typography>
                </div>

              </div>
            </div>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className="p-4 border-t border-green-200 bg-green-50">
        <div className="flex items-center gap-2">
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PauseIcon />}
                className="text-green-600 border-green-600 hover:border-green-700 hover:bg-green-50"
              >
                Pause
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                className="text-red-600 border-red-600 hover:border-red-700 hover:bg-red-50"
              >
                Abort
              </Button>
            </>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PlayArrowIcon />}
              className="text-green-600 border-green-600 hover:border-green-700 hover:bg-green-50"
            >
              Resume
            </Button>
        </div>
       
      </DialogActions>
    </Dialog>
  );
}; 