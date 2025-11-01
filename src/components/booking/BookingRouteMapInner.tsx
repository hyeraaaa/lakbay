"use client"

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle } from '@/services/bookingServices';

// Fix for default markers in React Leaflet
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowSize: [41, 41],
});

interface BookingRouteMapInnerProps {
  vehicle: Vehicle;
  liveLocation: { latitude: number; longitude: number } | null;
  routeCoordinates: [number, number][];
  mapCenter: [number, number];
  showControls?: boolean;
  hasTrackingDevice?: boolean | null;
}

// Custom icon for live location (green marker)
const createLiveLocationIcon = () => {
  return L.divIcon({
    className: 'custom-live-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #22c55e;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Custom icon for start location (blue marker)
const createStartIcon = () => {
  return L.divIcon({
    className: 'custom-start-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background-color: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

// Custom icon for end location (red marker)
const createEndIcon = () => {
  return L.divIcon({
    className: 'custom-end-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background-color: #ef4444;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

// Component to fit map to bounds
const FitBounds: React.FC<{ coordinates: [number, number][] }> = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { 
          padding: [40, 40], 
          animate: true, 
          maxZoom: 17 
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [coordinates, map]);
  
  return null;
};

export default function BookingRouteMapInner({
  vehicle,
  liveLocation,
  routeCoordinates,
  mapCenter,
  showControls = true,
  hasTrackingDevice,
}: BookingRouteMapInnerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug: Log polyline coordinates when they change
  useEffect(() => {
    if (routeCoordinates.length > 1) {
      console.log('Polyline GPS Coordinates:', {
        totalPoints: routeCoordinates.length,
        firstPoint: `Lat: ${routeCoordinates[0][0]}, Lng: ${routeCoordinates[0][1]}`,
        lastPoint: `Lat: ${routeCoordinates[routeCoordinates.length - 1][0]}, Lng: ${routeCoordinates[routeCoordinates.length - 1][1]}`,
        sampleCoords: routeCoordinates.slice(0, 5).map(([lat, lng]) => `[${lat}, ${lng}]`)
      });
    }
  }, [routeCoordinates]);

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Determine which coordinates to display on map
  const allCoordinates: [number, number][] = [];
  
  // Add route polyline coordinates
  if (routeCoordinates.length > 0) {
    allCoordinates.push(...routeCoordinates);
  }
  
  // Add live location if available
  if (liveLocation) {
    allCoordinates.push([liveLocation.latitude, liveLocation.longitude]);
  }

  // Use route coordinates for bounds, or fallback to mapCenter
  const boundsCoordinates = routeCoordinates.length > 0 ? routeCoordinates : (mapCenter ? [mapCenter] : []);

  return (
    <MapContainer
      style={{ height: '100%', width: '100%' }}
      className="z-0"
      worldCopyJump={false}
      attributionControl={false}
      zoomControl={showControls}
      maxZoom={19}
      center={mapCenter}
      zoom={routeCoordinates.length > 0 ? 13 : 14}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        detectRetina={true}
        updateWhenZooming={true}
        updateWhenIdle={true}
        noWrap={true}
      />

      {/* Auto-fit to bounds if we have route coordinates */}
      {boundsCoordinates.length > 0 && (
        <FitBounds coordinates={boundsCoordinates} />
      )}

      {/* Route polyline - trace the GPS route with latitude and longitude */}
      {routeCoordinates.length > 1 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#3b82f6',
            weight: 5,
            opacity: 0.9,
            smoothFactor: 1,
          }}
        />
      )}
      
      
      {/* Show message if no route data but we have a map center */}
      {routeCoordinates.length === 0 && mapCenter && (
        <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded-md shadow text-sm z-[1000]">
          <p className="text-gray-700">No route history available</p>
          <p className="text-xs text-gray-500">Showing current location only</p>
        </div>
      )}

      {/* Start marker (first point of route) */}
      {routeCoordinates.length > 0 && (
        <Marker
          position={routeCoordinates[0]}
          icon={createStartIcon()}
        >
          <Popup>
            <div className="text-sm">
              <strong>Start Location</strong>
              <br />
              <span className="text-xs text-gray-600">
                {vehicle.brand} {vehicle.model}
              </span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* End marker (last point of route, or live location if available) */}
      {liveLocation ? (
        <Marker
          position={[liveLocation.latitude, liveLocation.longitude]}
          icon={createLiveLocationIcon()}
        >
          <Popup>
            <div className="text-sm">
              <strong>Current Location</strong>
              <br />
              <span className="text-xs text-gray-600">
                {vehicle.brand} {vehicle.model}
              </span>
            </div>
          </Popup>
        </Marker>
      ) : routeCoordinates.length > 0 && (
        <Marker
          position={routeCoordinates[routeCoordinates.length - 1]}
          icon={createEndIcon()}
        >
          <Popup>
            <div className="text-sm">
              <strong>End Location</strong>
              <br />
              <span className="text-xs text-gray-600">
                {vehicle.brand} {vehicle.model}
              </span>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

