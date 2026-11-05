import React from 'react';
import { Shield, PlusSquare, Home, MapPin, Phone, Navigation } from 'lucide-react';
import { formatDistance } from '../../utils/distance';

const ResourceCard = ({ resource, isSelected, onSelect }) => {
  if (!resource) return null;

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'police':
        return {
          label: 'Police Outpost',
          icon: Shield,
          colorClass: 'text-blue-400 bg-blue-950/70 border-blue-800/60',
        };
      case 'hospital':
        return {
          label: 'Emergency Care',
          icon: PlusSquare,
          colorClass: 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60',
        };
      case 'safe_haven':
        return {
          label: 'Safe Haven',
          icon: Home,
          colorClass: 'text-pinkAccent-400 bg-pinkAccent-950/70 border-pinkAccent-800/60',
        };
      default:
        return {
          label: 'Assistance Point',
          icon: Shield,
          colorClass: 'text-brand-400 bg-brand-950/70 border-brand-800/60',
        };
    }
  };

  const meta = getCategoryMeta(resource.category);
  const Icon = meta.icon;

  return (
    <div
      onClick={() => onSelect(resource)}
      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-xs space-y-2.5 ${
        isSelected
          ? 'bg-navy-850 border-brand-500 shadow-soft-purple ring-1 ring-brand-500/40'
          : 'bg-navy-900 border-navy-800 hover:border-navy-700 hover:bg-navy-850/80'
      }`}
    >
      {/* Top: Category & Distance */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.colorClass}`}>
          <Icon className="w-3 h-3" />
          <span>{meta.label}</span>
        </span>

        {resource.distanceKm !== undefined && resource.distanceKm !== null && (
          <span className="text-[11px] font-bold text-white font-mono bg-navy-800 px-2 py-0.5 rounded-full border border-navy-700">
            {formatDistance(resource.distanceKm)}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-white leading-tight">
        {resource.name}
      </h4>

      {/* Address */}
      <div className="flex items-start space-x-1.5 text-slate-400 text-[11px]">
        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        <span className="line-clamp-1">{resource.address}</span>
      </div>

      {/* Bottom Actions */}
      <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
        <a
          href={`tel:${resource.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
        >
          <Phone className="w-3 h-3" />
          <span>Call Desk</span>
        </a>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(resource);
          }}
          className="inline-flex items-center space-x-1 text-[11px] text-brand-400 hover:text-brand-300 font-medium"
        >
          <Navigation className="w-3 h-3" />
          <span>Locate on Map</span>
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;

