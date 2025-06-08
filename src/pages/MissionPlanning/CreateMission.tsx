import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { missionService } from '../../services/missionService';
import { droneService } from '../../services/droneService';
import { Drone } from '../../types';
import MissionForm from '../../components/MissionForm/MissionForm';
import './CreateMission.css';

const CreateMission: React.FC = () => {
  const navigate = useNavigate();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        const response = await droneService.getDrones();
        setDrones(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load drones');
        console.error('Error loading drones:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrones();
  }, []);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      await missionService.createMission(formData);
      toast.success('Mission created successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/missions');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create mission';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Error creating mission:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="flex items-center justify-center mb-4">
          <div className="relative px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}
      <MissionForm
        drones={drones}
        onSubmit={handleSubmit}
        isEdit={false}
      />
    </div>
  );
};

export default CreateMission; 