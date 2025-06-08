
interface IDrone {
  _id: string;
  name: string;
  status: string;
}

export interface IMissionRun {
  _id: string;
  mission_id: string;
  drone_id: IDrone;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  missionSnapshot: {
    name: string;
    description?: string;
    flightPath: Array<{
      lat: number;
      lng: number;
      altitude: number;
    }>;
    site: string;
    pattern: 'perimeter' | 'crosshatch' | 'custom';
    parameters: {
      altitude: number;
      overlap: number;
      frequency: number;
      sensors: string[];
    };
  };
}

export type { IDrone }; 