import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import ResourcePopup from './ResourcePopup';

/**
 * Creates custom HTML Leaflet DivIcons to avoid image asset bundle issues
 * and provide modern styling matching the SafeRoute design system.
 */
export const createCustomIcon = (category) => {
  let bgColor = '#9333EA'; // brand purple
  let iconSvg = '';

  switch (category) {
    case 'police':
      bgColor = '#2563EB'; // Blue
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      break;
    case 'hospital':
      bgColor = '#059669'; // Emerald
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;
      break;
    case 'safe_haven':
      bgColor = '#EC4899'; // Pink
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      break;
    default:
      bgColor = '#7E22CE';
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  const html = `
    <div style="
      background-color: ${bgColor};
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.45);
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      ${iconSvg}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-resource-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

/**
 * Custom pulsing icon for the authenticated user's current GPS position
 */
export const createUserLocationIcon = () => {
  const html = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <span style="position: absolute; inset: -4px; border-radius: 50%; background-color: rgba(14, 165, 233, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #0284c7; border: 3px solid white; box-shadow: 0 0 12px #38bdf8;"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-user-location-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const ResourceMarker = ({ resource, userLocation, onSelect }) => {
  if (!resource || !resource.latitude || !resource.longitude) return null;

  const icon = createCustomIcon(resource.category);

  return (
    <Marker
      position={[resource.latitude, resource.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect && onSelect(resource),
      }}
    >
      <Popup className="custom-dark-popup">
        <ResourcePopup resource={resource} userLocation={userLocation} />
      </Popup>
    </Marker>
  );
};

export default ResourceMarker;

