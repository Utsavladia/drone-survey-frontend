import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateMissionInput, IWaypoint } from '../../types/mission';
import { Drone } from '../../types';
import Map from '../Map';
import './MissionForm.css';

interface MissionFormProps {
  mission?: any;
  drones: Drone[];
  onSubmit: (data: CreateMissionInput) => void;
  isEdit?: boolean;
}

const MissionForm: React.FC<MissionFormProps> = ({
  mission,
  drones,
  onSubmit,
  isEdit = false,
}) => {
  const navigate = useNavigate();
  console.log('mission in form', mission);
  console.log('drones in form', drones);
  const [formData, setFormData] = useState<CreateMissionInput>({
    name: mission?.name || '',
    description: mission?.description || '',
    site: mission?.site || '',
    pattern: mission?.pattern || 'perimeter',
    assignedDrone: mission?.assignedDrone || '',
    flightPath: mission?.flightPath || [],
    parameters: {
      altitude: mission?.parameters?.altitude || 100,
      overlap: mission?.parameters?.overlap || 75,
      frequency: mission?.parameters?.frequency || 1,
      sensors: mission?.parameters?.sensors || ['camera'],
    },
  });
  console.log('assigned drone in form', formData.assignedDrone);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('parameters.')) {
      const paramName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        parameters: {
          ...prev.parameters,
          [paramName]: paramName === 'sensors' ? [value] : Number(value),
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDrone = drones.find(d => d._id === formData.assignedDrone);
      if (!selectedDrone) {
        throw new Error('Selected drone not found');
      }

      const payload: CreateMissionInput = {
        ...formData,
        assignedDrone: selectedDrone._id,
      };

      await onSubmit(payload);
      navigate('/missions');
    } catch (err: any) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} mission:`, err);
    }
  };

  const handleWaypointAdd = (waypoint: IWaypoint) => {
    setFormData(prev => ({
      ...prev,
      flightPath: [...prev.flightPath, waypoint],
    }));
  };

  const handleWaypointRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      flightPath: prev.flightPath.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="w-full h-100vh">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left side - Map */}
              <div className="space-y-4">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">
                  {isEdit ? 'Edit Mission' : 'Create New Mission'}
                </h1>
                <div className="h-[450px] rounded-lg overflow-hidden border border-gray-200">
                  <Map
                    waypoints={formData.flightPath}
                    onWaypointAdd={handleWaypointAdd}
                    onWaypointRemove={handleWaypointRemove}
                  />
                </div>
                <div className="rounded-lg ">
                  <h3 className="mx-2 mb-2 text-base font-semibold text-gray-700">Waypoints ({formData.flightPath.length})</h3>
                  <div className="space-y-2 overflow-y-auto max-h-44">
                    {formData.flightPath.map((waypoint, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-2 rounded bg-gray-50">
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
              <form onSubmit={handleSubmit} className="py-10 space-y-6">
                <div className="space-y-1">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mission Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm"
                      placeholder="Enter mission name"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm"
                      placeholder="Enter mission description"
                    />
                  </div>

                  <div>
                    <label htmlFor="site" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Site
                    </label>
                    <input
                      type="text"
                      id="site"
                      name="site"
                      value={formData.site}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm"
                      placeholder="Enter site location"
                    />
                  </div>

                  <div>
                    <label htmlFor="pattern" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Flight Pattern
                    </label>
                    <div className="relative">
                      <select
                        id="pattern"
                        name="pattern"
                        value={formData.pattern}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm appearance-none cursor-pointer pr-10"
                      >
                        <option value="perimeter">Perimeter</option>
                        <option value="crosshatch">Crosshatch</option>
                        <option value="custom">Custom</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="assignedDrone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Assigned Drone
                    </label>
                    <div className="relative">
                      <select
                        id="assignedDrone"
                        name="assignedDrone"
                        value={formData.assignedDrone}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Select a drone</option>
                        {drones.map(drone => (
                          <option key={drone._id} value={drone._id}>
                            {drone.name} ({drone.droneModel})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sensors" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Sensors
                    </label>
                    <div className="relative">
                      <select
                        id="sensors"
                        name="sensors"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value && !formData.parameters.sensors.includes(value)) {
                            setFormData(prev => ({
                              ...prev,
                              parameters: {
                                ...prev.parameters,
                                sensors: [...prev.parameters.sensors, value]
                              }
                            }));
                          }
                          e.target.value = ''; // Reset select after selection
                        }}
                        className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm appearance-none cursor-pointer pr-10"
                      >
                        <option value="">Select sensors</option>
                        <option value="camera">Camera</option>
                        <option value="lidar">LiDAR</option>
                        <option value="thermal">Thermal</option>
                        <option value="multispectral">Multispectral</option>
                        <option value="gps">GPS</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.parameters.sensors.map((sensor, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full"
                        >
                          {sensor}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  sensors: prev.parameters.sensors.filter((_, i) => i !== index)
                                }
                              }));
                            }}
                            className="inline-flex items-center justify-center w-4 h-4 ml-2 rounded-full hover:bg-blue-200 focus:outline-none"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Parameters</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label htmlFor="altitude" className="block text-sm font-medium text-gray-600 mb-1.5">
                          Altitude (m)
                        </label>
                        <input
                          type="number"
                          id="altitude"
                          name="parameters.altitude"
                          value={formData.parameters.altitude}
                          onChange={handleChange}
                          required
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm"
                          placeholder="Enter altitude"
                        />
                      </div>
                      <div>
                        <label htmlFor="overlap" className="block text-sm font-medium text-gray-600 mb-1.5">
                          Overlap (%)
                        </label>
                        <input
                          type="number"
                          id="overlap"
                          name="parameters.overlap"
                          value={formData.parameters.overlap}
                          onChange={handleChange}
                          required
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm"
                          placeholder="Enter overlap"
                        />
                      </div>
                      <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-600 mb-1.5">
                          Frequency (Hz)
                        </label>
                        <input
                          type="number"
                          id="frequency"
                          name="parameters.frequency"
                          value={formData.parameters.frequency}
                          onChange={handleChange}
                          required
                          className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out sm:text-sm"
                          placeholder="Enter frequency"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/missions')}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formData.flightPath.length === 0}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isEdit ? 'Update Mission' : 'Create Mission'}
                  </button>
                </div>
              </form>
            </div>
    </div>
  );
};

export default MissionForm; 