import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { missionRunService } from '../../services/missionRunService';
import { IMissionRun } from '../../types/missionRun';
import { MissionRunDetailsModal } from '../MissionRunDetailsModal/MissionRunDetailsModal';
import { getTimeAgo } from '../../utils/timeUtils';

const RunningMissions: React.FC = () => {
  const [runningMissions, setRunningMissions] = useState<IMissionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<IMissionRun | null>(null);

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

  const handleMissionClick = (mission: IMissionRun) => {
    setSelectedMission(mission);
  };

  const handleCloseModal = () => {
    setSelectedMission(null);
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
    <Box>
      <div className="grid grid-cols-1 gap-4">
        {runningMissions.map((missionRun) => (
          <div
            key={missionRun._id}
            className="p-4 transition-colors duration-200 border border-green-200 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100"
            onClick={() => handleMissionClick(missionRun)}
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
              <div className="flex flex-col items-end justify-between ">
                <Chip
                  label="Running"
                  color="success"
                  size="small"
                  className="mb-2"
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

      {selectedMission && (
        <MissionRunDetailsModal
          missionRun={selectedMission}
          open={!!selectedMission}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
};

export default RunningMissions; 