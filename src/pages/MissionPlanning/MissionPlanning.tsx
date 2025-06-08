import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMission } from '../../types/mission';
import { missionService } from '../../services/missionService';
import { droneService } from '../../services/droneService';
import { Box, Button, Typography, CircularProgress, Alert, Snackbar, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MissionDetailsModal from '../../components/MissionDetailsModal/MissionDetailsModal';
import './MissionPlanning.css';
import { toast } from 'react-toastify';

interface IDrone {
  _id: string;
  name: string;
  status: string;
}

function MissionPlanning() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<IMission[]>([]);
  const [drones, setDrones] = useState<IDrone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<IMission | null>(null);

  useEffect(() => {
    fetchMissions();
    fetchAvailableDrones();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const data = await missionService.getAllMissions();
      setMissions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load missions');
      console.error('Error loading missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrones = async () => {
    try {
      const data = await droneService.getAvailableDrones();
      setDrones(data);
    } catch (err) {
      console.error('Error loading drones:', err);
    }
  };

  const handleCreateMission = () => {
    navigate('/missions/create');
  };

  const handleMissionClick = (mission: IMission) => {
    setSelectedMission(mission);
  };

  const handleCloseModal = () => {
    setSelectedMission(null);
  };

  const handleEditMission = (missionId: string) => {
    navigate(`/missions/${missionId}/edit`);
  };

  const handleRunMission = async (missionId: string, selectedDrone: string | null) => {
    if (!selectedDrone) {
      // use toastify to show a notification
      toast.error('Please select a drone to run the mission');
      return;
    }
    try {
      await missionService.startMission(missionId, selectedDrone);
      toast.success('Mission started successfully');
      fetchMissions(); // Refresh the missions list
      handleCloseModal();
    } catch (err) {
      toast.error('Failed to start mission');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="mission-planning">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Missions</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateMission}
        >
          Create Mission
        </Button>
      </Box>

      <Box className="missions-grid">
        {missions.map((mission) => (
          <Box
            key={mission._id}
            className="mission-card"
            onClick={() => handleMissionClick(mission)}
          >
            <Typography variant="h6">{mission.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {mission.description}
            </Typography>
            <Box mt={1}>
              <Typography variant="body2">
                Status: <span className={`status-${mission.status}`}>{mission.status}</span>
              </Typography>
              <Typography variant="body2">Site: {mission.site}</Typography>
              <Typography variant="body2">Pattern: {mission.pattern}</Typography>
              <Typography variant="body2">
                Created: {new Date(mission.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {selectedMission && (
        <MissionDetailsModal
          mission={selectedMission}
          open={!!selectedMission}
          onClose={handleCloseModal}
          onEdit={handleEditMission}
          onRun={handleRunMission}
          drones={drones}
        />
      )}
    </Box>
  );
}

export default MissionPlanning; 