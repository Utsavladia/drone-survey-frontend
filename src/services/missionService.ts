import axios, { AxiosError } from 'axios';
import { IMission, CreateMissionInput, MissionUpdate } from '../types/mission';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MissionServiceError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'MissionServiceError';
  }
}

export const missionService = {
  async getAllMissions(): Promise<IMission[]> {
    try {
      const response = await axios.get<IMission[]>(`${API_URL}/api/missions`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MissionServiceError('Failed to fetch missions', error.response?.data);
      }
      throw error;
    }
  },

  async getMissionById(id: string): Promise<IMission> {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mission');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching mission:', error);
      throw error;
    }
  },

  async createMission(missionData: CreateMissionInput): Promise<IMission> {
    try {
      console.log('Frontend - Sending mission creation request to:', `${API_BASE_URL}/missions`);
      console.log('Frontend - Request payload:', JSON.stringify(missionData, null, 2));
      
      const response = await axios.post<IMission>(`${API_BASE_URL}/missions`, missionData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Frontend - Received response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Frontend - Error creating mission:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new MissionServiceError(
          error.response?.data?.message || 'Failed to create mission',
          error.response?.data
        );
      }
      console.error('Frontend - Unknown error creating mission:', error);
      throw error;
    }
  },

  async updateMission(id: string, mission: Partial<IMission>): Promise<IMission> {
    const response = await axios.put(`${API_URL}/api/missions/${id}`, mission);
    return response.data;
  },

  async deleteMission(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/missions/${id}`);
  },

  async startMission(missionId: string, droneId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/missions/${missionId}/run`, {
        droneId
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MissionServiceError('Failed to start mission', error.response?.data);
      }
      throw error;
    }
  },

  async pauseMission(id: string): Promise<void> {
    await axios.post(`${API_URL}/api/missions/${id}/pause`);
  },

  async resumeMission(id: string): Promise<void> {
    await axios.post(`${API_URL}/api/missions/${id}/resume`);
  },

  async abortMission(id: string): Promise<void> {
    await axios.post(`${API_URL}/api/missions/${id}/abort`);
  },

  async getCurrentMission(droneId: string): Promise<IMission> {
    const response = await axios.get(`${API_URL}/api/missions/current/${droneId}`);
    return response.data;
  }
};