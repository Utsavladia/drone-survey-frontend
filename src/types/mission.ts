export type MissionStatus = 'planned' | 'in-progress' | 'completed' | 'aborted' | 'paused';

export interface IWaypoint {
  lat: number;
  lng: number;
  altitude: number;
}

export interface IDrone {
  id: string;
  name: string;
  battery: number;
  currentPosition: {
    lat: number;
    lng: number;
  };
  currentWaypointIndex: number;
}

export interface IMission {
  _id: string;
  name: string;
  description: string;
  status: MissionStatus;
  flightPath: IWaypoint[];
  site: string;
  pattern: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
  assignedDrone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for creating a new mission
export interface CreateMissionInput {
  name: string;
  description: string;
  flightPath: IWaypoint[];
  site: string;
  pattern?: 'perimeter' | 'crosshatch' | 'custom';
  parameters: {
    altitude: number;
    overlap: number;
    frequency: number;
    sensors: string[];
  };
  assignedDrone: string;
}

// Default values for creating a new mission
export const defaultMissionValues: CreateMissionInput = {
  name: '',
  description: '',
  flightPath: [],
  site: '',
  pattern: 'perimeter',
  parameters: {
    altitude: 100,
    overlap: 75,
    frequency: 1,
    sensors: ['camera']
  },
  assignedDrone: ''
};

export type CreateMissionPayload = Omit<IMission, '_id' | 'createdAt' | 'updatedAt'>;

export interface MissionUpdate {
  missionId: string;
  status: MissionStatus;
  position: {
    lat: number;
    lng: number;
    altitude: number;
  };
  batteryLevel: number;
  progress: number;
} 