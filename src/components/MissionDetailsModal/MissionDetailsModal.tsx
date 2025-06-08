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
    // If mission has an assigned drone and it's available in drones list, use it
    if (mission?.assignedDrone && drones.some(drone => String(drone._id) === String(mission.assignedDrone))) {
      setSelectedDrone(String(mission.assignedDrone));
    } else {
      // If no assigned drone or it's not available, set to null
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
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{mission.name}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Map Section */}
          <Box sx={{ flex: { md: '2' } }}>
            <Box className="map-container">
              <Map
                waypoints={mission.flightPath}
                onWaypointAdd={() => {}}
                onWaypointRemove={() => {}}
                isMissionActive={false}
              />
            </Box>
          </Box>

          {/* Mission Details Section */}
          <Box sx={{ flex: { md: '1' } }}>
            <Box className="mission-details">
              <Typography variant="h6" gutterBottom>
                Mission Details
              </Typography>

              <Box mb={2} display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body1">{mission.description}</Typography>
              </Box>

              <Box mb={2} display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={mission.status}
                  className={`status-chip status-${mission.status}`}
                  size="small"
                />
              </Box>

              <Box mb={2} display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Site
                </Typography>
                <Typography variant="body1">{mission.site}</Typography>
              </Box>

              <Box mb={2} display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Pattern
                </Typography>
                <Typography variant="body1" className="text-capitalize">
                  {mission.pattern}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Parameters
                </Typography>
                <Box className="parameters-grid" display="flex" alignItems="center" gap={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Altitude
                    </Typography>
                    <Typography variant="body2">{mission.parameters.altitude}m</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Overlap
                    </Typography>
                    <Typography variant="body2">{mission.parameters.overlap}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Frequency
                    </Typography>
                    <Typography variant="body2">{mission.parameters.frequency}Hz</Typography>
                  </Box>
                </Box>
              </Box>

              <Box mb={2} display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Sensors
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {mission.parameters.sensors.map((sensor) => (
                    <Chip key={sensor} label={sensor} size="small" />
                  ))}
                </Box>
              </Box>

              {mission.status === 'planned' && (
                <Box mb={2}>
                  <FormControl fullWidth>
                    {isAssignedDroneAvailable ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {drones.find(drone => String(drone._id) === String(mission.assignedDrone))?.name}
                        </Typography>
                        <Chip
                          label="Available" 
                          size="small"
                          color="success"
                        />
                      </Box>
                    ) : (
                      <>
                        <InputLabel id="drone-select-label">Select Drone</InputLabel>
                        <Select
                          labelId="drone-select-label"
                          value={selectedDrone || ''}
                          label="Select Drone"
                          onChange={(e) => handleDroneSelect(e.target.value)}
                        >
                          {drones.map((drone) => (
                            <MenuItem key={drone._id} value={drone._id}>
                              {drone.name} ({drone.status})
                            </MenuItem>
                          ))}
                        </Select>
                        {!selectedDrone && <Typography variant="body2" color="error" sx={{ my: 1 }}>
                          Assigned drone is not available. Please select from available drones to run this mission:
                        </Typography>}
                      </>
                    )}
                  </FormControl>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<EditIcon />}
          onClick={() => onEdit(mission._id)}
          variant="outlined"
        >
          Edit Mission
        </Button>
        <Button
          startIcon={<PlayArrowIcon />}
          onClick={() => onRun(mission._id, selectedDrone)}
          variant="contained"
          color="primary"
          disabled={mission.status !== 'planned' || (!selectedDrone && !isAssignedDroneAvailable)}
        >
          Run Mission
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MissionDetailsModal; 