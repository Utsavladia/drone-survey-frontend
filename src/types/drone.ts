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