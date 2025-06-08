import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { missionRunService } from '../../services/missionRunService';
import { IMissionRun } from '../../types/missionRun';
import './MissionHistory.css';

const MissionHistory: React.FC = () => {
  const [completedMissions, setCompletedMissions] = useState<IMissionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedMissions();
  }, []);

  const fetchCompletedMissions = async () => {
    try {
      setLoading(true);
      const missions = await missionRunService.getCompletedMissions();
      setCompletedMissions(missions);
      setError(null);
    } catch (err) {
      setError('Failed to load mission history');
      console.error('Error loading mission history:', err);
      setCompletedMissions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
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

  if (!completedMissions || completedMissions.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body1" color="text.secondary">
          No completed missions found
        </Typography>
      </Box>
    );
  }

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Mission History
      </Typography>
      <Box className="mission-history-grid">
        {completedMissions.map((missionRun) => (
          <Box
            key={missionRun._id}
            className="mission-card completed"
            sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography variant="h6">{missionRun.missionSnapshot.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {missionRun.missionSnapshot.description}
            </Typography>
            <Box mt={1}>
              <Typography variant="body2">
                Status: <span className="status-completed">Completed</span>
              </Typography>
              <Typography variant="body2">
                Started: {new Date(missionRun.started_at).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Completed: {missionRun.completed_at ? new Date(missionRun.completed_at).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body2">
                Drone: {missionRun.drone_id.name}
              </Typography>
              <Typography variant="body2">
                Site: {missionRun.missionSnapshot.site}
              </Typography>
              <Typography variant="body2">
                Pattern: {missionRun.missionSnapshot.pattern}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MissionHistory; 