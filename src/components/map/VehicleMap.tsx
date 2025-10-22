"use client";

import dynamic from 'next/dynamic';
import { VehicleResponse } from '@/services/vehicleServices';

const VehicleMapInner = dynamic(() => import('./VehicleMapInner'), { ssr: false });

interface VehicleMapProps {
  vehicles: VehicleResponse[];
  isLoading?: boolean;
  className?: string;
  showControls?: boolean;
  showZoomControl?: boolean;
  markerVariant?: 'price' | 'pin';
  center?: [number, number] | null;
  zoom?: number | null;
  interactiveMarkers?: boolean;
  showMarkerPopups?: boolean;
  singleMarkerZoom?: number | null;
  autoFitOnUpdate?: boolean | null;
}

const VehicleMap: React.FC<VehicleMapProps> = (props) => {
  return <VehicleMapInner {...props} />;
};

export default VehicleMap;



