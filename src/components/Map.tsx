import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Waypoint } from '../types';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapProps {
  waypoints: Waypoint[];
  onWaypointAdd: (waypoint: Waypoint) => void;
  onWaypointRemove: (index: number) => void;
  dronePosition?: { lat: number; lng: number; altitude: number };
  isMissionActive?: boolean;
  currentLocation?: { lat: number; lng: number; altitude: number };
}

const MapClickHandler: React.FC<{ onWaypointAdd: (waypoint: Waypoint) => void }> = ({ onWaypointAdd }) => {
  useMapEvent('click', (e) => {
    const newWaypoint: Waypoint = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      altitude: 100,
    };
    onWaypointAdd(newWaypoint);
  });
  return null;
};

const Map: React.FC<MapProps> = ({ 
  waypoints, 
  onWaypointAdd, 
  onWaypointRemove,
  dronePosition,
  isMissionActive,
  currentLocation
}) => {
  // Create drone icon
  const droneIcon = new L.Icon({
    iconUrl: '/drone-icon.png', // You'll need to add this icon to your public folder
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div style={{ height: 600, width: '100%', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickHandler onWaypointAdd={onWaypointAdd} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Draw waypoints */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={index}
            position={[waypoint.lat, waypoint.lng]}
          >
            <Popup>
              Waypoint {index + 1}<br />
              Altitude: {waypoint.altitude}m
            </Popup>
          </Marker>
        ))}

        {/* Draw flight path */}
        {waypoints.length > 1 && (
          <Polyline
            positions={waypoints.map(wp => [wp.lat, wp.lng])}
            color="#3388ff"
            weight={3}
          />
        )}

        {/* Show drone position if mission is active */}
        {isMissionActive && dronePosition && (
          <Marker
            position={[dronePosition.lat, dronePosition.lng]}
            icon={droneIcon}
          >
            <Popup>
              Drone Position<br />
              Altitude: {dronePosition.altitude}m
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map; 