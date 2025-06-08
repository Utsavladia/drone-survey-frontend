import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { missionRunService } from '../../services/missionRunService';
import { IMissionRun } from '../../types/missionRun';
import './RunningMissions.css';

const RunningMissions: React.FC = () => {
  const [runningMissions, setRunningMissions] = useState<IMissionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRunningMissions();
  }, []);

  const fetchRunningMissions = async () => {
    try {
      setLoading(true);
      const missions = await missionRunService.getRunningMissions();
      setRunningMissions(missions);
      setError(null);
    } catch (err) {
      setError('Failed to load running missions');
      console.error('Error loading running missions:', err);
      setRunningMissions([]);
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

  if (!runningMissions || runningMissions.length === 0) {
    return null;
  }

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        Running Missions
      </Typography>
      <Box className="running-missions-grid">
        {runningMissions.map((missionRun) => (
          <Box
            key={missionRun._id}
            className="mission-card running"
            sx={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
            }}
          >
            <Typography variant="h6">{missionRun.missionSnapshot.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {missionRun.missionSnapshot.description}
            </Typography>
            <Box mt={1}>
              <Typography variant="body2">
                Status: <span className="status-running">Running</span>
              </Typography>
              <Typography variant="body2">
                Started: {new Date(missionRun.started_at).toLocaleString()}
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

export default RunningMissions; 