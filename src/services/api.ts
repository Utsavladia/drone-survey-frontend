import axios from 'axios';
import { Drone, Mission, SurveyReport } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Drone API calls
export const droneApi = {
  getAll: () => api.get<Drone[]>('/drones'),
  getById: (id: string) => api.get<Drone>(`/drones/${id}`),
  create: (data: Partial<Drone>) => api.post<Drone>('/drones', data),
  update: (id: string, data: Partial<Drone>) => api.put<Drone>(`/drones/${id}`, data),
  delete: (id: string) => api.delete(`/drones/${id}`),
};

// Mission API calls
export const missionApi = {
  getAll: () => api.get<Mission[]>('/missions'),
  getById: (id: string) => api.get<Mission>(`/missions/${id}`),
  create: (data: Partial<Mission>) => api.post<Mission>('/missions', data),
  update: (id: string, data: Partial<Mission>) => api.put<Mission>(`/missions/${id}`, data),
  delete: (id: string) => api.delete(`/missions/${id}`),
  pause: (id: string) => api.post<Mission>(`/missions/${id}/pause`),
  resume: (id: string) => api.post<Mission>(`/missions/${id}/resume`),
  abort: (id: string) => api.post<Mission>(`/missions/${id}/abort`),
};

// Survey Report API calls
export const reportApi = {
  getAll: () => api.get<SurveyReport[]>('/reports'),
  getById: (id: string) => api.get<SurveyReport>(`/reports/${id}`),
  getByMission: (missionId: string) => api.get<SurveyReport>(`/reports/mission/${missionId}`),
}; 