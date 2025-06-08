import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Map from '../Map';
import { IMissionRun } from '../../types/missionRun';
import './MissionRunDetailsModal.css';

interface MissionRunDetailsModalProps {
  missionRun: IMissionRun;
  open: boolean;
  onClose: () => void;
}

const MissionRunDetailsModal: React.FC<MissionRunDetailsModalProps> = ({
  missionRun,
  open,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className="mission-run-details-modal"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Mission Run Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Map Section */}
          <Box sx={{ flex: { md: '1' } }}>
            <Box className="map-container">
              <Map
                waypoints={missionRun.missionSnapshot.flightPath}
                onWaypointAdd={() => {}}
                onWaypointRemove={() => {}}
                isMissionActive={true}
              />
            </Box>
          </Box>

          {/* Details Section */}
          <Box sx={{ flex: { md: '1' } }}>
            <Box className="details-container">
              <Typography variant="h6" gutterBottom>
                {missionRun.missionSnapshot.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {missionRun.missionSnapshot.description}
              </Typography>

              <Box className="detail-section">
                <Typography variant="subtitle1" gutterBottom>
                  Run Information
                </Typography>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Run ID
                  </Typography>
                  <Typography variant="body1">{missionRun._id}</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" className="status-running">
                    {missionRun.status}
                  </Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Started At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(missionRun.started_at).toLocaleString()}
                  </Typography>
                </Box>
                {missionRun.completed_at && (
                  <Box className="detail-item">
                    <Typography variant="body2" color="text.secondary">
                      Completed At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(missionRun.completed_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box className="detail-section">
                <Typography variant="subtitle1" gutterBottom>
                  Drone Information
                </Typography>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Drone Name
                  </Typography>
                  <Typography variant="body1">{missionRun.drone_id.name}</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Drone Status
                  </Typography>
                  <Typography variant="body1">{missionRun.drone_id.status}</Typography>
                </Box>
              </Box>

              <Box className="detail-section">
                <Typography variant="subtitle1" gutterBottom>
                  Mission Parameters
                </Typography>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Site
                  </Typography>
                  <Typography variant="body1">{missionRun.missionSnapshot.site}</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Pattern
                  </Typography>
                  <Typography variant="body1">{missionRun.missionSnapshot.pattern}</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Altitude
                  </Typography>
                  <Typography variant="body1">{missionRun.missionSnapshot.parameters.altitude}m</Typography>
                </Box>
                <Box className="detail-item">
                  <Typography variant="body2" color="text.secondary">
                    Overlap
                  </Typography>
                  <Typography variant="body1">{missionRun.missionSnapshot.parameters.overlap}%</Typography>
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

export default MissionRunDetailsModal; 