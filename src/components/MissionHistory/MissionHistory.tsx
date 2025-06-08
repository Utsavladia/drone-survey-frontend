import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { missionRunService } from '../../services/missionRunService';
import { IMissionRun } from '../../types/missionRun';
import { getTimeAgo } from '../../utils/timeUtils';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'failed':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
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
    <Box>
      <div className="grid grid-cols-1 gap-4">
        {completedMissions.map((missionRun) => (
          <div
            key={missionRun._id}
            className={`p-4 transition-colors duration-200 border rounded-lg ${getStatusBackground(missionRun.status)}`}
          >
            <div className="flex justify-between">
              {/* Left side content */}
              <div className="flex-1">
                <Typography variant="h5" className="font-bold text-gray-900">
                  {missionRun.missionSnapshot.name}
                </Typography>
                <Typography variant="body2" className="mt-1 text-gray-600">
                  {missionRun.missionSnapshot.description}
                </Typography>
                <div className="flex items-center mt-2 text-gray-600">
                  <img src="/drone1.png" alt="Drone" className="w-8 h-8 mr-1" />
                  <Typography variant="body2">
                    {missionRun.drone_id.name}
                  </Typography>
                </div>
              </div>

              {/* Right side content */}
              <div className="flex flex-col items-end justify-between">
                <Chip
                  label={missionRun.status}
                  color={getStatusColor(missionRun.status)}
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
          </div>
        ))}
      </div>
    </Box>
  );
};

export default MissionHistory; 