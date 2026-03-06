import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import type { ReportResponse } from "@shared/routes";

interface MapPanelProps {
  reports: ReportResponse[];
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (loc: { lat: number; lng: number }) => void;
  isSelecting: boolean;
}

// Custom icons based on severity
const createMarkerIcon = (severity: string) => {
  const color = 
    severity === "High" ? "#ef4444" : 
    severity === "Medium" ? "#f59e0b" : 
    "#22c55e";

  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="
        background-color: ${color}; 
        width: 16px; 
        height: 16px; 
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 0 10px ${color};
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

const defaultIcon = L.divIcon({
  className: "custom-leaflet-icon",
  html: `
    <div style="
      background-color: #0ea5e9; 
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 0 15px #0ea5e9;
      animation: pulse 2s infinite;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapEvents({ onLocationSelect, isSelecting }: { onLocationSelect: (l: any) => void, isSelecting: boolean }) {
  useMapEvents({
    click(e) {
      if (isSelecting) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export function MapPanel({ reports, selectedLocation, onLocationSelect, isSelecting }: MapPanelProps) {
  // Default to NYC coordinates
  const [center] = useState<[number, number]>([40.7128, -74.0060]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden relative h-[400px] lg:h-[500px] border border-white/10 group flex flex-col">
      <div className="absolute top-4 left-4 z-[400] bg-background/90 backdrop-blur border border-white/10 rounded-lg p-3 flex items-center gap-3 shadow-xl">
        <MapPin className="w-5 h-5 text-secondary" />
        <div>
          <p className="text-sm font-medium text-white">Live City Map</p>
          <p className="text-xs text-muted-foreground">
            {isSelecting ? "Click map to drop a pin" : `${reports.length} civic issues reported`}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full h-full z-0 relative">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%', background: '#0a0f1d' }}
          className="z-0"
        >
          {/* Dark Mode CartoDB Map */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
          
          <MapEvents onLocationSelect={onLocationSelect} isSelecting={isSelecting} />

          {reports.map((report) => {
            if (!report.latitude || !report.longitude) return null;
            return (
              <Marker 
                key={report.id} 
                position={[parseFloat(report.latitude), parseFloat(report.longitude)]}
                icon={createMarkerIcon(report.severity)}
              >
                <Popup className="custom-popup">
                  <div className="p-1">
                    <h4 className="font-bold text-sm mb-1 text-white">{report.problemType}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-2">{report.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{report.authority}</span>
                      <span>❤️ {report.upvotes}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {selectedLocation && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]} 
              icon={defaultIcon} 
            />
          )}
        </MapContainer>
      </div>
      
      {isSelecting && (
        <div className="absolute inset-0 ring-4 ring-primary inset-ring pointer-events-none rounded-2xl z-[500] animate-pulse" />
      )}
    </div>
  );
}
