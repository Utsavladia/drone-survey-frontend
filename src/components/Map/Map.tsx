import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface DroneLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  speed: number;
  timestamp: Date;
  batteryLevel: number;
}

interface MapProps {
  waypoints: Array<{ lat: number; lng: number; altitude: number }>;
  onWaypointAdd?: (lat: number, lng: number) => void;
  onWaypointRemove?: (index: number) => void;
  isMissionActive?: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    batteryLevel?: number;
  } | null;
}

const MapEvents = ({ onWaypointAdd, isMissionActive }: { onWaypointAdd?: (lat: number, lng: number) => void; isMissionActive?: boolean }) => {
  useMapEvents({
    click: (e) => {
      if (onWaypointAdd && !isMissionActive) {
        onWaypointAdd(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const Map = ({
  waypoints,
  onWaypointAdd,
  onWaypointRemove,
  isMissionActive = false,
  currentLocation,
}: MapProps) => {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (mapRef.current && waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints.map(wp => [wp.lat, wp.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [waypoints]);

  useEffect(() => {
    if (mapRef.current && currentLocation) {
      mapRef.current.setView(
        [currentLocation.latitude, currentLocation.longitude],
        mapRef.current.getZoom()
      );
    }
  }, [currentLocation]);

  return (
    <MapContainer
      center={waypoints[0] ? [waypoints[0].lat, waypoints[0].lng] : [0, 0]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <MapEvents onWaypointAdd={onWaypointAdd} isMissionActive={isMissionActive} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Draw flight path */}
      {waypoints.length > 1 && (
        <Polyline
          positions={waypoints.map(wp => [wp.lat, wp.lng])}
          color={isMissionActive ? '#4caf50' : '#2196f3'}
          weight={3}
        />
      )}

      {/* Draw waypoints */}
      {waypoints.map((point, index) => (
        <Marker
          key={index}
          position={[point.lat, point.lng]}
          eventHandlers={{
            contextmenu: (e) => {
              e.originalEvent.preventDefault();
              if (onWaypointRemove && !isMissionActive) {
                onWaypointRemove(index);
              }
            },
          }}
        >
          <Popup>
            Waypoint {index + 1}
            <br />
            Lat: {point.lat.toFixed(6)}
            <br />
            Lng: {point.lng.toFixed(6)}
            <br />
            Altitude: {point.altitude}m
          </Popup>
        </Marker>
      ))}

      {/* Draw current drone location */}
      {currentLocation && (
        <Marker
          position={[currentLocation.latitude, currentLocation.longitude]}
          icon={L.divIcon({
            className: 'drone-marker',
            html: `<img src="/drone1.png" style="width: 50px; height: 50px; z-index: 1000;" />`,
            iconSize: [50, 50],
            iconAnchor: [20, 20],
          })}
        >
          <Popup>
            Current Location
            <br />
            Heading: {currentLocation.heading || 0}°
            <br />
            Battery: {currentLocation.batteryLevel?.toFixed(1) || 'N/A'}%
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map; 