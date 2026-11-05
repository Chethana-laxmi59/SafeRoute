import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import ResourceMarker, { createUserLocationIcon } from './ResourceMarker';
import { formatDistance } from '../../utils/distance';

// Leaflet map controller to handle smooth flying / panning to selected coordinates
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] !== undefined && center[1] !== undefined) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);

  return null;
};

const DEFAULT_CENTER = [28.6139, 77.2090]; // Demonstration center (Delhi/Connaught)
const DEFAULT_ZOOM = 13;

const SafetyMap = ({
  resources = [],
  userLocation = null,
  selectedResource = null,
  onSelectResource,
  activeCenter = null,
}) => {
  // Determine primary map center: user location > selected resource > default
  const mapCenter = activeCenter
    ? [activeCenter.latitude, activeCenter.longitude]
    : userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : selectedResource
    ? [selectedResource.latitude, selectedResource.longitude]
    : resources.length > 0
    ? [resources[0].latitude, resources[0].longitude]
    : DEFAULT_CENTER;

  const userIcon = createUserLocationIcon();

  return (
    <div className="relative w-full h-full min-h-[450px] sm:min-h-[550px] rounded-3xl overflow-hidden border border-navy-800 shadow-2xl z-0">
      
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ background: '#0D1322' }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Dynamic map center and panning controller */}
        <MapController
          center={mapCenter}
          zoom={selectedResource ? 15 : userLocation ? 14 : DEFAULT_ZOOM}
        />

        {/* User GPS Location Marker & Accuracy Radius */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup className="custom-dark-popup">
                <div className="p-1 text-slate-100 text-xs space-y-1">
                  <div className="font-bold text-sky-400 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block mr-1 animate-pulse"></span>
                    <span>Your Current GPS Location</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    {userLocation.latitude.toFixed(5)}°, {userLocation.longitude.toFixed(5)}°
                  </div>
                  {userLocation.accuracy && (
                    <div className="text-[10px] text-slate-400">
                      Accuracy radius: ±{userLocation.accuracy} meters
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Location accuracy circle */}
            {userLocation.accuracy && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: '#0284c7',
                  fillColor: '#38bdf8',
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
            )}
          </>
        )}

        {/* Safety Resources Markers */}
        {resources.map((resource) => (
          <ResourceMarker
            key={resource._id || resource.id}
            resource={resource}
            userLocation={userLocation}
            onSelect={onSelectResource}
          />
        ))}

      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-2xl bg-navy-900/90 backdrop-blur-md border border-navy-750 shadow-lg hidden sm:block text-[11px] text-slate-300 space-y-1.5 pointer-events-auto">
        <div className="font-bold text-white text-[10px] uppercase tracking-wider mb-1">
          Map Legend
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span>Police Outposts & Desks</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>24/7 Hospitals & Medical</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block"></span>
          <span>Safe Havens & Sanctuaries</span>
        </div>
        {userLocation && (
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
            <span>Your Current Location</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default SafetyMap;

