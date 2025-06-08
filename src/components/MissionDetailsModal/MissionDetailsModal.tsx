import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IMission } from '../../types/mission';
import Map from '../Map';
import './MissionDetailsModal.css';

interface IDrone {
  _id: string;
  name: string;
  status: string;
}

interface MissionDetailsModalProps {
  mission: IMission;
  open: boolean;
  onClose: () => void;
  onEdit: (missionId: string) => void;
  onRun: (missionId: string, selectedDrone: string | null) => void;
  drones: IDrone[];
}

const MissionDetailsModal: React.FC<MissionDetailsModalProps> = ({
  mission,
  open,
  onClose,
  onEdit,
  onRun,
  drones,
}) => {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);

  useEffect(() => {
    if (mission?.assignedDrone && drones.some(drone => String(drone._id) === String(mission.assignedDrone))) {
      setSelectedDrone(String(mission.assignedDrone));
    } else {
      setSelectedDrone(null);
    }
  }, [mission, drones]);

  const handleDroneSelect = (droneId: string) => {
    setSelectedDrone(droneId);
  };

  const isAssignedDroneAvailable = drones.some(drone => String(drone._id) === String(mission.assignedDrone));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className="mission-details-modal"
    >
      <DialogTitle className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{mission.name}</h2>
          <IconButton onClick={onClose} size="small" className="text-gray-500 hover:text-gray-700">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="p-4">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Map Section */}
          <div className="flex-1">
            <div className="h-[480px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <Map
                waypoints={mission.flightPath}
                onWaypointAdd={() => {}}
                onWaypointRemove={() => {}}
                isMissionActive={false}
              />
            </div>
          </div>

          {/* Mission Details Section */}
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Mission Details</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="w-24 text-sm font-medium text-gray-500">Description</span>
                  <p className="flex-1 text-sm text-gray-900">{mission.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-500">Status</span>
                  <Chip
                    label={mission.status}
                    className={`status-chip status-${mission.status} text-xs font-medium px-2 py-1 rounded-full`}
                    size="small"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-500">Site</span>
                  <p className="text-sm text-gray-900">{mission.site}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-500">Pattern</span>
                  <p className="text-sm text-gray-900 capitalize">{mission.pattern}</p>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-500">Parameters</span>
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-xs text-gray-500">Altitude</p>
                      <p className="text-sm font-medium text-gray-900">{mission.parameters.altitude}m</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Overlap</p>
                      <p className="text-sm font-medium text-gray-900">{mission.parameters.overlap}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Frequency</p>
                      <p className="text-sm font-medium text-gray-900">{mission.parameters.frequency}Hz</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-500">Sensors</span>
                  <div className="flex flex-wrap gap-2">
                    {mission.parameters.sensors.map((sensor) => (
                      <Chip
                        key={sensor}
                        label={sensor}
                        size="small"
                        className="text-xs font-medium text-blue-700 bg-blue-50"
                      />
                    ))}
                  </div>
                </div>

                {mission.status === 'planned' && (
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-500">Drone Assignment</span>
                    <FormControl fullWidth>
                      {isAssignedDroneAvailable ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50">
                          <span className="text-sm font-medium text-green-800">
                            {drones.find(drone => String(drone._id) === String(mission.assignedDrone))?.name}
                          </span>
                          <Chip
                            label="Available"
                            size="small"
                            className="text-green-800 bg-green-100"
                          />
                        </div>
                      ) : (
                        <div className="flex space-x-4">
                          <Select
                            value={selectedDrone || ''}
                            onChange={(e) => handleDroneSelect(e.target.value)}
                            className="bg-white"
                            size="small"
                          >
                            {drones.map((drone) => (
                              <MenuItem key={drone._id} value={drone._id}>
                                {drone.name} ({drone.status})
                              </MenuItem>
                            ))}
                          </Select>
                          {!selectedDrone && (
                            <p className="text-sm text-red-600">
                              Assigned drone is not available. Please select from available drones to run this mission.
                            </p>
                          )}
                        </div>
                      )}
                    </FormControl>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="px-6 py-8 border-gray-200 bg-gray-50">
        <Button
          startIcon={<EditIcon />}
          onClick={() => onEdit(mission._id)}
          variant="outlined"
          className="text-gray-700 border-gray-300 hover:bg-gray-50"
        >
          Edit Mission
        </Button>
        <Button
          startIcon={<PlayArrowIcon />}
          onClick={() => onRun(mission._id, selectedDrone)}
          variant="contained"
          color="primary"
          disabled={mission.status !== 'planned' || (!selectedDrone && !isAssignedDroneAvailable)}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
        >
          Run Mission
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MissionDetailsModal; 