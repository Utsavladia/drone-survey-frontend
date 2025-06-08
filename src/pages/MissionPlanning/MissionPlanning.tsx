import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMission } from '../../types/mission';
import { missionService } from '../../services/missionService';
import { droneService } from '../../services/droneService';
import { missionRunService } from '../../services/missionRunService';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MissionDetailsModal from '../../components/MissionDetailsModal/MissionDetailsModal';
import RunningMissions from '../../components/RunningMissions/RunningMissions';
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
  const [activeTab, setActiveTab] = useState<'running' | 'history'>('running');

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
      toast.error('Please select a drone to run the mission');
      return;
    }
    try {
      await missionRunService.startMission(missionId, selectedDrone);
      toast.success('Mission started successfully');
      fetchMissions();
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center">
        <Typography variant="h4">Missions</Typography>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Fixed Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'running'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('running')}
              >
                Running Missions
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Mission History
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'running' ? (
              <div className="p-4">
                <RunningMissions />
              </div>
            ) : (
              <div className="p-4">
                {/* Add your mission history component here */}
                <Typography variant="body1" color="text.secondary">
                  Mission history will be displayed here
                </Typography>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - All Missions */}
        <div className="w-1/2 flex flex-col">
          {/* Fixed Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
            <Typography variant="h6">All Missions</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateMission}
              size="small"
            >
              Create Mission
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex flex-col gap-4">
                {missions.map((mission) => (
                  <div
                    key={mission._id}
                    className="mission-card bg-gray-50 p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleMissionClick(mission)}
                  >
                    <Typography variant="h6">{mission.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mission.description}
                    </Typography>
                    <div className="mt-2">
                      <Typography variant="body2">
                        Status: <span className={`status-${mission.status}`}>{mission.status}</span>
                      </Typography>
                      <Typography variant="body2">Site: {mission.site}</Typography>
                      <Typography variant="body2">Pattern: {mission.pattern}</Typography>
                      <Typography variant="body2">
                        Created: {new Date(mission.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default MissionPlanning; 