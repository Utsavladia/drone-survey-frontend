import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreateMissionInput } from '../../types/mission';
import { missionService } from '../../services/missionService';
import { droneService } from '../../services/droneService';
import { Drone } from '../../types';
import MissionForm from '../../components/MissionForm/MissionForm';
import './EditMission.css';

const EditMission: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dronesResponse, missionResponse] = await Promise.all([
          droneService.getDrones(),
          missionService.getMissionById(id!)
        ]);
        setDrones(dronesResponse.data);
        setMission(missionResponse);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData: CreateMissionInput) => {
    try {
      setLoading(true);
      const selectedDrone = drones.find(d => d._id === formData.assignedDrone);
      if (!selectedDrone) {
        throw new Error('Selected drone not found');
      }

      await missionService.updateMission(id!, formData);
      toast.success('Mission updated successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate(`/missions`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update mission';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Error updating mission:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="relative px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="relative px-4 py-3 text-yellow-700 bg-yellow-100 border border-yellow-400 rounded" role="alert">
            <strong className="font-bold">Warning: </strong>
            <span className="block sm:inline">Mission not found</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div >
          <MissionForm
            mission={mission}
            drones={drones}
            onSubmit={handleSubmit}
            isEdit={true}
          />
        </div>
  );
};

export default EditMission; 