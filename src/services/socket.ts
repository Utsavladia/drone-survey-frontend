import { Drone } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: any = null;

  connect() {
    if (!this.socket) {
      console.log('Initializing socket connection to:', SOCKET_URL);
      // @ts-ignore
      this.socket = require('socket.io-client')(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully, ID:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error: Error) => {
        console.error('Socket error:', error);
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
      });

      // Log all incoming events
      this.socket.onAny((eventName: string, ...args: unknown[]) => {
        console.log('Received event:', eventName, args);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToDroneUpdates(callback: (drone: Drone) => void) {
    if (this.socket) {
      console.log('Subscribing to drone updates');
      this.socket.on('drone:update', (data: Drone) => {
        console.log('Received drone update event:', data);
        callback(data);
      });
    } else {
      console.warn('Cannot subscribe to drone updates: socket not connected');
    }
  }

  unsubscribeFromDroneUpdates(callback: (drone: Drone) => void) {
    if (this.socket) {
      console.log('Unsubscribing from drone updates');
      this.socket.off('drone:update', callback);
    }
  }

  subscribeToMissionUpdates(callback: (mission: any) => void) {
    if (this.socket) {
      console.log('Subscribing to mission updates');
      this.socket.on('mission:update', callback);
    }
  }

  unsubscribeFromMissionUpdates(callback: (mission: any) => void) {
    if (this.socket) {
      console.log('Unsubscribing from mission updates');
      this.socket.off('mission:update', callback);
    }
  }

  subscribeToDroneStatus(callback: (data: { droneId: string; status: string }) => void) {
    if (this.socket) {
      this.socket.on('droneStatus', callback);
    }
  }

  unsubscribeFromDroneStatus(callback: (data: { droneId: string; status: string }) => void) {
    if (this.socket) {
      this.socket.off('droneStatus', callback);
    }
  }
}

export const socketService = new SocketService(); 