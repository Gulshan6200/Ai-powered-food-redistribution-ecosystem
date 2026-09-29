import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface RedistributionMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  waypoints?: Array<[number, number]>;
  stops?: Array<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    type: 'PICKUP' | 'DROPOFF';
    quantityKg: number;
  }>;
}

export const RedistributionMap: React.FC<RedistributionMapProps> = ({
  centerLat = 12.8399,
  centerLng = 77.6770,
  zoom = 13,
  waypoints = [],
  stops = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous vector layers and markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Custom Icons using SVG data URLs
    const kitchenIcon = L.divIcon({
      className: 'custom-kitchen-pin',
      html: `<div style="background-color: #059669; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">🍳</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const dropoffIcon = L.divIcon({
      className: 'custom-ngo-pin',
      html: `<div style="background-color: #2563eb; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">🏢</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // Add Stop Markers
    stops.forEach((stop) => {
      const icon = stop.type === 'PICKUP' ? kitchenIcon : dropoffIcon;
      L.marker([stop.lat, stop.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: ${stop.type === 'PICKUP' ? '#059669' : '#2563eb'}">${stop.type}: ${stop.name}</strong>
            <p style="margin: 4px 0; font-size: 12px; color: #475569;">${stop.address}</p>
            <span style="font-size: 11px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">Batch: ${stop.quantityKg} kg</span>
          </div>
        `);
    });

    // Draw Route Polyline
    if (waypoints.length > 1) {
      const polyline = L.polyline(waypoints, {
        color: '#10b981',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    return () => {
      // Map cleanup if unmounting
    };
  }, [centerLat, centerLng, zoom, waypoints, stops]);

  return (
    <div className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-3 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
          <span>Kitchen / Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          <span>NGO / Dropoff</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
          <span>Optimized Path</span>
        </div>
      </div>
    </div>
  );
};
