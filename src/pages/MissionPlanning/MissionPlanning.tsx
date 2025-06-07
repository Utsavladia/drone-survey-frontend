import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMission } from '../../types/mission';
import { missionService } from '../../services/missionService';
import { Box, Button, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './MissionPlanning.css';

function MissionPlanning() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<IMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchMissions();
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

  const handleCreateMission = () => {
    navigate('/missions/create');
  };

  const handleMissionClick = (missionId: string) => {
    navigate(`/missions/${missionId}`);
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

      {notification && (
        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
        >
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}

      <Box className="missions-grid">
        {missions.map((mission) => (
          <Box
            key={mission._id}
            className="mission-card"
            onClick={() => handleMissionClick(mission._id)}
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
    </Box>
  );
}

export default MissionPlanning; 