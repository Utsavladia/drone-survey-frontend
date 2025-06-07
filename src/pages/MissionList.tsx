import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IMission } from '../types/mission';
import { missionService } from '../services/missionService';
import MissionControl from '../components/MissionControl';
import './MissionList.css';

export const MissionList: React.FC = () => {
  const [missions, setMissions] = useState<IMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const data = await missionService.getAllMissions();
        setMissions(data);
        setError(null);
      } catch (err) {
        setError('Failed to load missions');
        console.error('Error loading missions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (loading) return <div className="loading">Loading missions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="mission-list">
      <h1>Missions</h1>
      <div className="missions-grid">
        {missions.map((mission) => (
          <div key={mission._id} className="mission-card">
            <h2>{mission.name}</h2>
            <p>{mission.description}</p>
            <div className="mission-details">
              <p>Status: {mission.status}</p>
              <p>Site: {mission.site}</p>
              <p>Pattern: {mission.pattern}</p>
            </div>
            <div className="mission-actions">
              <Link to={`/missions/${mission._id}`} className="view-button">
                View Details
              </Link>
              <MissionControl mission={mission} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 