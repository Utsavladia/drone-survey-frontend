import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IMission, IWaypoint, CreateMissionInput } from '../../types/mission';
import { missionService } from '../../services/missionService';
import { droneService } from '../../services/droneService';
import { Drone } from '../../types';
import Map from '../../components/Map';
import './CreateMission.css';

interface FormData {
  name: string;
  description: string;
  site: string;
  pattern: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
  assignedDrone: string;
  flightPath: IWaypoint[];
}

const CreateMission: React.FC = () => {
  const navigate = useNavigate();
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    site: '',
    pattern: 'perimeter',
    parameters: {
      altitude: 100,
      overlap: 75,
      frequency: 1,
      sensors: ['camera']
    },
    assignedDrone: '',
    flightPath: []
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('parameters.')) {
      const paramName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [paramName]: paramName === 'sensors' ? [value] : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleWaypointAdd = (waypoint: IWaypoint) => {
    setFormData(prev => ({
      ...prev,
      flightPath: [...prev.flightPath, waypoint]
    }));
  };

  const handleWaypointRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      flightPath: prev.flightPath.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const selectedDrone = drones.find(d => d._id === formData.assignedDrone);
      if (!selectedDrone) {
        throw new Error('Selected drone not found');
      }

      const payload: CreateMissionInput = {
        name: formData.name,
        description: formData.description,
        site: formData.site,
        pattern: formData.pattern,
        assignedDrone: selectedDrone._id,
        flightPath: formData.flightPath,
        parameters: {
          altitude: formData.parameters.altitude,
          overlap: formData.parameters.overlap,
          frequency: formData.parameters.frequency,
          sensors: formData.parameters.sensors
        }
      };

      await missionService.createMission(payload);
      toast.success('Mission created successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate(`/missions`);
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
  
 
    


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="flex items-center justify-center ">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Mission</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left side - Map */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Flight Path Planning</h2>
                <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
                  <Map
                    waypoints={formData.flightPath}
                    onWaypointAdd={handleWaypointAdd}
                    onWaypointRemove={handleWaypointRemove}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Waypoints ({formData.flightPath.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.flightPath.map((waypoint, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                        <span className="text-sm">
                          Point {index + 1}: {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}
                        </span>
                        <button
                          onClick={() => handleWaypointRemove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side - Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Mission Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="site" className="block text-sm font-medium text-gray-700">
                      Site
                    </label>
                    <input
                      type="text"
                      id="site"
                      name="site"
                      value={formData.site}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="pattern" className="block text-sm font-medium text-gray-700">
                      Flight Pattern
                    </label>
                    <select
                      id="pattern"
                      name="pattern"
                      value={formData.pattern}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="perimeter">Perimeter</option>
                      <option value="crosshatch">Crosshatch</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assignedDrone" className="block text-sm font-medium text-gray-700">
                      Assigned Drone
                    </label>
                    <select
                      id="assignedDrone"
                      name="assignedDrone"
                      value={formData.assignedDrone}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select a drone</option>
                      {drones.map(drone => (
                        <option key={drone._id} value={drone._id}>
                          {drone.name} ({drone.droneModel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Parameters</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="altitude" className="block text-xs text-gray-500">
                          Altitude (m)
                        </label>
                        <input
                          type="number"
                          id="altitude"
                          name="parameters.altitude"
                          value={formData.parameters.altitude}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="overlap" className="block text-xs text-gray-500">
                          Overlap (%)
                        </label>
                        <input
                          type="number"
                          id="overlap"
                          name="parameters.overlap"
                          value={formData.parameters.overlap}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="frequency" className="block text-xs text-gray-500">
                          Frequency (Hz)
                        </label>
                        <input
                          type="number"
                          id="frequency"
                          name="parameters.frequency"
                          value={formData.parameters.frequency}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={formData.flightPath.length === 0}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Mission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMission; 