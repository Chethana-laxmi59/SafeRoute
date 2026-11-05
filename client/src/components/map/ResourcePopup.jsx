import React from 'react';
import { Shield, PlusSquare, Home, MapPin, Clock, Phone, ExternalLink, AlertOctagon } from 'lucide-react';
import { formatDistance } from '../../utils/distance';

const ResourcePopup = ({ resource, userLocation }) => {
  if (!resource) return null;

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'police':
        return {
          label: 'Police Outpost',
          icon: Shield,
          badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
        };
      case 'hospital':
        return {
          label: 'Hospital / Trauma Care',
          icon: PlusSquare,
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
        };
      case 'safe_haven':
        return {
          label: 'Community Safe Haven',
          icon: Home,
          badgeClass: 'bg-pinkAccent-950 text-pinkAccent-300 border-pinkAccent-800',
        };
      default:
        return {
          label: 'Safety Resource',
          icon: Shield,
          badgeClass: 'bg-navy-800 text-slate-300 border-navy-700',
        };
    }
  };

  const meta = getCategoryMeta(resource.category);
  const Icon = meta.icon;

  return (
    <div className="p-1 max-w-[280px] text-slate-100 font-sans space-y-2.5">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeClass}`}>
            <Icon className="w-3 h-3" />
            <span>{meta.label}</span>
          </span>

          {resource.distanceKm !== undefined && resource.distanceKm !== null && (
            <span className="text-[10px] font-semibold text-brand-300 bg-brand-950/70 border border-brand-800/60 px-2 py-0.5 rounded-full">
              {formatDistance(resource.distanceKm)}
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-white leading-tight">
          {resource.name}
        </h4>
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-[11px] text-slate-300 leading-normal">
          {resource.description}
        </p>
      )}

      {/* Details List */}
      <div className="space-y-1.5 text-[11px] text-slate-300 pt-1 border-t border-navy-750">
        
        {/* Address */}
        <div className="flex items-start space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-pinkAccent-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{resource.address}</span>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{resource.operatingHours || '24/7 Available'}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-1.5">
          <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <a
            href={`tel:${resource.phone}`}
            className="text-emerald-300 hover:text-emerald-200 font-mono font-medium underline"
          >
            {resource.phone}
          </a>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="pt-1.5 border-t border-navy-750 flex items-center space-x-1 text-[10px] text-amber-400/90">
        <AlertOctagon className="w-3 h-3 flex-shrink-0" />
        <span>Simulated Academic Demonstration Entry</span>
      </div>

    </div>
  );
};

export default ResourcePopup;

