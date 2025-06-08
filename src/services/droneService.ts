import axios from 'axios';
import { Drone } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class DroneService {
  async getDrones() {
    return axios.get<Drone[]>(`${API_URL}/drones`);
  }

  async getDroneById(id: string) {
    return axios.get<Drone>(`${API_URL}/drones/${id}`);
  }

  async createDrone(drone: Omit<Drone, '_id'>) {
    return axios.post<Drone>(`${API_URL}/drones`, drone);
  }

  async updateDrone(id: string, drone: Partial<Drone>) {
    return axios.put<Drone>(`${API_URL}/drones/${id}`, drone);
  }

  async deleteDrone(id: string) {
    return axios.delete(`${API_URL}/drones/${id}`);
  }

  async getAvailableDrones(): Promise<Drone[]> {
    try {
      const response = await axios.get<Drone[]>(`${API_URL}/drones/available`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Failed to fetch available drones');
      }
      throw error;
    }
  }
}

export const droneService = new DroneService(); 