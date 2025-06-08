import axios from 'axios';
import { IMissionRun } from '../types/missionRun';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class MissionRunServiceError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'MissionRunServiceError';
  }
}

export const missionRunService = {
  async getRunningMissions(): Promise<IMissionRun[]> {
    try {
      const response = await axios.get<{ success: boolean; data: IMissionRun[] }>(`${API_URL}/missions/running`);
      if (!response.data.success) {
        throw new MissionRunServiceError('Failed to fetch running missions', response.data);
      }
      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MissionRunServiceError('Failed to fetch running missions', error.response?.data);
      }
      throw error;
    }
  },

  async getCompletedMissions(): Promise<IMissionRun[]> {
    try {
      const response = await axios.get<{ success: boolean; data: IMissionRun[] }>(`${API_URL}/missions/history`);
      if (!response.data.success) {
        throw new MissionRunServiceError('Failed to fetch completed missions', response.data);
      }
      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MissionRunServiceError('Failed to fetch completed missions', error.response?.data);
      }
      throw error;
    }
  },

  async startMission(missionId: string, droneId: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/missions/${missionId}/run`, {
        droneId
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MissionRunServiceError('Failed to start mission', error.response?.data);
      }
      throw error;
    }
  },

  async stopMissionRun(missionRunId: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/missions/${missionRunId}/stop`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MissionRunServiceError('Failed to stop mission run', error.response?.data);
      }
      throw error;
    }
  },

  async getMissionRunById(id: string): Promise<IMissionRun> {
    try {
      const response = await axios.get<IMissionRun>(`${API_URL}/missions/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new MissionRunServiceError('Failed to fetch mission run', error.response?.data);
      }
      throw error;
    }
  }
}; 