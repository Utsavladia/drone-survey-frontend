export interface Waypoint {
  lat: number;
  lng: number;
  altitude: number;
}

export interface Drone {
  _id: string;
  name: string;
  droneModel: string;
  status: 'available' | 'in-mission' | 'charging' | 'maintenance';
  batteryLevel: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  lastActive: Date;
  currentMission?: string;
}

export interface Mission {
  _id: string;
  name: string;
  description: string;
  site: string;
  drone: string;
  flightPath: Waypoint[];
  pattern: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
  status: 'planned' | 'in-progress' | 'completed' | 'aborted';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyReport {
  _id: string;
  mission: string;
  duration: number;
  distance: number;
  coverage: number;
  summary: string;
  createdAt: Date;
} 