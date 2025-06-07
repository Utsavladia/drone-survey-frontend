import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { MissionUpdate } from '../types/mission';

class SocketService {
  private socket: typeof Socket | null = null;
  private missionUpdateCallbacks: ((update: MissionUpdate) => void)[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001');

    this.socket?.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket?.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket?.on('missionUpdate', (update: MissionUpdate) => {
      this.missionUpdateCallbacks.forEach(callback => callback(update));
    });

    this.socket?.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  public subscribeToMissionUpdates(callback: (update: MissionUpdate) => void) {
    this.missionUpdateCallbacks.push(callback);
    return () => {
      this.missionUpdateCallbacks = this.missionUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService(); 