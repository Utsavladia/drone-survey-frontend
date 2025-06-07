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
}

export const droneService = new DroneService(); 