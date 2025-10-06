"use client";

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { VehicleResponse } from '@/services/vehicleServices';
import { LocateFixed } from 'lucide-react';
import VehicleMarkers from '@/components/map/VehicleMarkers';
import UserLocationLayer from '@/components/map/UserLocationLayer';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import { useRouteToFirstVehicle } from '@/hooks/map/useRouteToFirstVehicle';
import { useSearchParams } from 'next/navigation';

// Fix for default markers in React Leaflet
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string
}
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VehicleMapProps {
  vehicles: VehicleResponse[];
  isLoading?: boolean;
  className?: string;
  showControls?: boolean;
  markerVariant?: 'price' | 'pin';
  center?: [number, number] | null;
  zoom?: number | null;
  interactiveMarkers?: boolean;
  showMarkerPopups?: boolean;
  singleMarkerZoom?: number | null;
  autoFitOnUpdate?: boolean | null;
}

const VehicleMap: React.FC<VehicleMapProps> = ({ vehicles, isLoading, className = "", showControls = true, markerVariant = 'price', center, zoom, interactiveMarkers = true, showMarkerPopups = true, singleMarkerZoom = 16, autoFitOnUpdate = true }) => {
  const [isClient, setIsClient] = useState(false);
  const { coords: internalUserLocation, accuracy: userAccuracy, isActive, error: locateError, toggle, disable } = useUserLocation();
  const { routeCoords, routeInfo } = useRouteToFirstVehicle(internalUserLocation, vehicles);

  // No hardcoded default center/bounds. We will only fit to real coordinates.

  useEffect(() => {
    setIsClient(true);
  }, []);


// Vehicle marker icon and user icon moved to dedicated components

  // Coordinate helpers moved to VehicleMarkers

  // Fit map view to vehicle markers
  const FitToVehicles: React.FC<{ coords: Array<[number, number]> }> = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
      const valid = coords.filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));
      if (valid.length === 0) return;
      const effectiveUser = internalUserLocation;
      if (effectiveUser && Number.isFinite(effectiveUser[0]) && Number.isFinite(effectiveUser[1])) {
        const bounds = L.latLngBounds([effectiveUser, ...valid]);
        map.fitBounds(bounds, { padding: [40, 40], animate: true });
        return;
      }
      if (valid.length === 1) {
        const z = Number.isFinite(singleMarkerZoom) ? (singleMarkerZoom ?? 14) : 14;
        map.setView(valid[0], z, { animate: true });
      } else {
        const bounds = L.latLngBounds(valid);
        map.fitBounds(bounds, { padding: [40, 40], animate: true });
      }
    }, [coords, map]);
    return null;
  };

  // Imperatively set view to a geocoded center
  const SetViewToCenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      if (Number.isFinite(center[0]) && Number.isFinite(center[1]) && Number.isFinite(zoom)) {
        map.setView(center, zoom, { animate: true });
      }
    }, [center, zoom, map]);
    return null;
  };

  // Routing moved to hook

  if (!isClient) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Determine if we have any valid coordinates to show
  const validCoords = vehicles
    .map(v => {
      const lat = v.garage_latitude != null ? Number(v.garage_latitude) : NaN;
      const lon = v.garage_longitude != null ? Number(v.garage_longitude) : NaN;
      return [lat, lon] as [number, number];
    })
    .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));

  // Show loading state when no coords and no geocoded center
  if (validCoords.length === 0 && !internalUserLocation && !center) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        worldCopyJump={false}
        attributionControl={false}
        center={validCoords.length === 0 && !internalUserLocation && center ? center : undefined}
        zoom={validCoords.length === 0 && !internalUserLocation && zoom ? zoom : undefined}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />
        {autoFitOnUpdate && validCoords.length > 0 && <FitToVehicles coords={validCoords} />}
        {validCoords.length === 0 && !internalUserLocation && center && zoom && (
          <SetViewToCenter center={center} zoom={zoom} />
        )}
        
        <VehicleMarkers vehicles={vehicles} markerVariant={markerVariant} interactive={interactiveMarkers} showPopups={showMarkerPopups} />

        {/* User location marker */}
        <UserLocationLayer coords={internalUserLocation} accuracy={userAccuracy} />

        {/* Route polyline */}
        {routeCoords.length > 0 && (
          <>
            <Polyline positions={routeCoords} pathOptions={{ color: '#16a34a', weight: 5, opacity: 0.9 }} />
            {routeInfo && (
              <Popup position={routeCoords[Math.floor(routeCoords.length / 2)]}>
                <div className="text-sm">
                  <div><strong>Distance:</strong> {routeInfo.distanceKm.toFixed(1)} km</div>
                  <div><strong>ETA:</strong> {Math.round(routeInfo.durationMin)} min</div>
                </div>
              </Popup>
            )}
          </>
        )}
        {/* Empty state overlay when no coordinates */}
        {validCoords.length === 0 && !internalUserLocation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/85 backdrop-blur-sm px-4 py-3 rounded-md text-sm text-gray-700 shadow">
              No vehicles found for the selected location and dates
            </div>
          </div>
        )}

      </MapContainer>

      {/* Inline map control: single locate icon */}
      {showControls && (
      <button
        className={`absolute top-3 right-3 z-[1000] w-10 h-10 rounded-full shadow flex items-center justify-center active:scale-95 border ${internalUserLocation ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
        title={internalUserLocation ? 'Disable my location' : 'Use my location'}
        aria-label={internalUserLocation ? 'Disable my location' : 'Use my location'}
        aria-pressed={internalUserLocation ? 'true' : 'false'}
        onClick={toggle}
      >
        <LocateFixed className={`w-5 h-5 ${internalUserLocation ? 'text-white' : 'text-gray-800'}`} />
      </button>
      )}
      
      {/* Custom CSS for vehicle markers */}
      <style jsx global>{`
        .vehicle-marker {
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .vehicle-marker--simple {
          width: 36px;
          height: 36px;
        }

        .vehicle-marker:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        
        .vehicle-marker-icon {
          font-size: 16px;
          line-height: 1;
        }
        
        .vehicle-marker-price {
          font-size: 8px;
          font-weight: bold;
          color: #059669;
          line-height: 1;
          margin-top: 1px;
        }
        
        .vehicle-popup {
          min-width: 200px;
        }
        
        .leaflet-popup-content {
          margin: 8px 12px;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .user-marker-circle {
          background: #2563eb;
          border: 2px solid #1d4ed8;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .user-marker-glyph {
          color: white;
          font-size: 18px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default VehicleMap;



