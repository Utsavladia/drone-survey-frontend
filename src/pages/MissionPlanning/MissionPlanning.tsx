import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMission } from '../../types/mission';
import { missionService } from '../../services/missionService';
import { droneService } from '../../services/droneService';
import { missionRunService } from '../../services/missionRunService';
import { Box, Button, Typography, CircularProgress, Alert, Chip, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MissionDetailsModal from '../../components/MissionDetailsModal/MissionDetailsModal';
import RunningMissions from '../../components/RunningMissions/RunningMissions';
import MissionHistory from '../../components/MissionHistory/MissionHistory';
import './MissionPlanning.css';
import { toast } from 'react-toastify';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GridOnIcon from '@mui/icons-material/GridOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HeightIcon from '@mui/icons-material/Height';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SensorsIcon from '@mui/icons-material/Sensors';

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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Fixed Header */}
      <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
        <p className="text-2xl font-semibold text-gray-800">Missions</p>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateMission}
          className="bg-green-600 hover:bg-green-700"
        >
          Create Mission
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 p-4 overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col w-1/2 bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="flex h-16 border-b border-gray-200">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'running'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('running')}
            >
              Running Missions
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Mission History
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'running' ? (
              <div className="p-6">
                <RunningMissions />
              </div>
            ) : (
              <div className="p-6">
                <MissionHistory />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - All Missions */}
        <div className="flex flex-col w-1/2 rounded-lg shadow-sm bg-gradient-to-br from-gray-50 to-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <Typography variant="h6" className="font-semibold text-gray-800">
              All Missions
            </Typography>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white/50">
            <div className="flex flex-col gap-4">
                {missions.map((mission) => (
                  <div
                    key={mission._id}
                    className="px-5 py-3 transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer group bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-lg hover:border-gray-300 hover:from-gray-100 hover:to-gray-md"
                    onClick={() => handleMissionClick(mission)}
                  >
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Typography variant="h6" className="font-semibold text-gray-900 transition-colors group-hover:text-gray-800">
                          {mission.name}
                        </Typography>
                        <Typography variant="body2" className="mt-0.5 text-gray-500 line-clamp-2">
                          {mission.description}
                        </Typography>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 ml-4">
                        <Chip
                          label={mission.status}
                          className={`capitalize ${
                            mission.status === 'planned'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : mission.status === 'completed'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}
                          size="small"
                        />
                        <div className="flex items-center gap-1.5">
                          <AccessTimeIcon className="w-3.5 h-3.5 text-gray-400" />
                          <Typography variant="caption" className="text-gray-500">
                            {new Date(mission.createdAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-2 transition-colors border-t border-gray-200 group-hover:border-gray-300" />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Site and Pattern */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 transition-colors rounded-lg bg-white/50 group-hover:bg-white/80">
                          <LocationOnIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <Typography variant="caption" className="text-gray-500">
                              Site
                            </Typography>
                            <Typography variant="body2" className="font-medium text-gray-900">
                              {mission.site}
                            </Typography>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 transition-colors rounded-lg bg-white/50 group-hover:bg-white/80">
                          <GridOnIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <Typography variant="caption" className="text-gray-500">
                              Pattern
                            </Typography>
                            <Typography variant="body2" className="font-medium text-gray-900 capitalize">
                              {mission.pattern}
                            </Typography>
                          </div>
                        </div>
                      </div>

                      {/* Parameters */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 transition-colors rounded-lg bg-white/50 group-hover:bg-white/80">
                          <HeightIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <Typography variant="caption" className="text-gray-500">
                              Altitude
                            </Typography>
                            <Typography variant="body2" className="font-medium text-gray-900">
                              {mission.parameters.altitude}m
                            </Typography>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 transition-colors rounded-lg bg-white/50 group-hover:bg-white/80">
                          <SensorsIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <Typography variant="caption" className="text-gray-500">
                              Sensors
                            </Typography>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mission.parameters.sensors.map((sensor, index) => (
                                <Chip
                                  key={index}
                                  label={sensor}
                                  size="small"
                                  className="text-gray-700 transition-colors border border-gray-200 bg-white/80 group-hover:border-gray-300"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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