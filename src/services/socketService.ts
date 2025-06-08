import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

export interface DroneLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  speed: number;
  timestamp: Date;
  batteryLevel: number;
  progress: number;
  estimatedTimeRemaining: number;
}

interface DroneLocationUpdate {
  missionId: string;
  location: DroneLocation;
}

class SocketService {
  private socket: typeof Socket | null = null;
  private locationCallbacks: Map<string, ((location: DroneLocation) => void)[]> = new Map();
  private isConnecting: boolean = false;
  private connectionAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  constructor() {
    // Don't connect automatically
  }

  private connect() {
    if (this.socket?.connected || this.isConnecting) {
      console.log('SocketService: Already connected or connecting');
      return;
    }

    console.log('SocketService: Initiating connection to server');
    this.isConnecting = true;
    this.connectionAttempts = 0;

    this.socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: false, // Disable automatic reconnection
    });

    this.socket.on('connect', () => {
      console.log('SocketService: Connected to server successfully');
      this.isConnecting = false;
      this.connectionAttempts = 0;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('SocketService: Connection error:', error);
      this.isConnecting = false;
      this.connectionAttempts++;

      if (this.connectionAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        console.error('SocketService: Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('SocketService: Disconnected from server');
      this.isConnecting = false;
    });

    this.socket.on('drone_location_update', (update: DroneLocationUpdate) => {
      console.log('SocketService: Received location update:', {
        missionId: update.missionId,
        location: update.location
      });
      const callbacks = this.locationCallbacks.get(update.missionId) || [];
      console.log(`SocketService: Found ${callbacks.length} callbacks for mission ${update.missionId}`);
      callbacks.forEach(callback => callback(update.location));
    });

    this.socket.on('error', (error: Error) => {
      console.error('SocketService: Socket error:', error);
    });
  }

  public subscribeToMission(missionId: string, callback: (location: DroneLocation) => void) {
    console.log('SocketService: Subscribing to mission:', missionId);
    
    // Connect if not already connected
    if (!this.socket?.connected) {
      console.log('SocketService: Socket not connected, initiating connection');
      this.connect();
    }

    if (!this.socket) {
      console.error('SocketService: Failed to establish socket connection');
      return;
    }

    // Add callback to the map
    const callbacks = this.locationCallbacks.get(missionId) || [];
    callbacks.push(callback);
    this.locationCallbacks.set(missionId, callbacks);
    console.log(`SocketService: Added callback for mission ${missionId}, total callbacks: ${callbacks.length}`);

    // Subscribe to mission updates
    this.socket.emit('subscribe_to_mission', missionId);
    console.log('SocketService: Emitted subscribe_to_mission event for mission:', missionId);

    // Return unsubscribe function
    return () => {
      console.log('SocketService: Unsubscribing from mission:', missionId);
      const callbacks = this.locationCallbacks.get(missionId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`SocketService: Removed callback for mission ${missionId}, remaining callbacks: ${callbacks.length}`);
      }
      if (callbacks.length === 0) {
        this.locationCallbacks.delete(missionId);
        this.socket?.emit('unsubscribe_from_mission', missionId);
        console.log('SocketService: Emitted unsubscribe_from_mission event for mission:', missionId);

        // If no more active subscriptions, disconnect
        if (this.locationCallbacks.size === 0) {
          console.log('SocketService: No more active subscriptions, disconnecting');
          this.disconnect();
        }
      }
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.locationCallbacks.clear();
      this.isConnecting = false;
      this.connectionAttempts = 0;
    }
  }
}

export const socketService = new SocketService(); 