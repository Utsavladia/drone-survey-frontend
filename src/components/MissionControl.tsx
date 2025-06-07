import React, { useState, useEffect } from 'react';
import { IMission, MissionUpdate } from '../types/mission';
import { missionService } from '../services/missionService';
import { socketService } from '../services/socketService';
import './MissionControl.css';

interface MissionControlProps {
  mission: IMission;
  onMissionUpdate?: (update: MissionUpdate) => void;
}

const MissionControl: React.FC<MissionControlProps> = ({ mission, onMissionUpdate }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState(mission.status);

  useEffect(() => {
    const handleMissionUpdate = (update: MissionUpdate) => {
      if (update.missionId === mission._id) {
        setStatus(update.status);
        onMissionUpdate?.(update);
      }
    };

    // Subscribe to mission updates
    const unsubscribe = socketService.subscribeToMissionUpdates(handleMissionUpdate);

    // Set initial connection state
    setIsConnected(true);

    return () => {
      unsubscribe();
    };
  }, [mission._id, onMissionUpdate]);

  const handleStart = async () => {
    try {
      await missionService.startMission(mission._id);
      setStatus('in-progress');
    } catch (error) {
      console.error('Failed to start mission:', error);
    }
  };

  const handlePause = async () => {
    try {
      await missionService.pauseMission(mission._id);
      setStatus('paused');
    } catch (error) {
      console.error('Failed to pause mission:', error);
    }
  };

  const handleResume = async () => {
    try {
      await missionService.resumeMission(mission._id);
      setStatus('in-progress');
    } catch (error) {
      console.error('Failed to resume mission:', error);
    }
  };

  const handleAbort = async () => {
    try {
      await missionService.abortMission(mission._id);
      setStatus('aborted');
    } catch (error) {
      console.error('Failed to abort mission:', error);
    }
  };

  return (
    <div className="mission-control">
      <div className="status-indicator">
        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="mission-status">
        <h3>Mission Status: {status}</h3>
        <div className="mission-info">
          <p>Name: {mission.name}</p>
          <p>Site: {mission.site}</p>
          <p>Pattern: {mission.pattern}</p>
        </div>
      </div>

      <div className="control-buttons">
        {status === 'planned' && (
          <button onClick={handleStart} className="start-button">
            Start Mission
          </button>
        )}
        {status === 'in-progress' && (
          <>
            <button onClick={handlePause} className="pause-button">
              Pause
            </button>
            <button onClick={handleAbort} className="abort-button">
              Abort
            </button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button onClick={handleResume} className="resume-button">
              Resume
            </button>
            <button onClick={handleAbort} className="abort-button">
              Abort
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MissionControl; 