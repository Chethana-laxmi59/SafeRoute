import React from 'react';
import { Shield, PlusSquare, Home, Compass } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: Compass, color: 'brand' },
  { id: 'police', label: 'Police Outposts', icon: Shield, color: 'blue' },
  { id: 'hospital', label: 'Hospitals & Care', icon: PlusSquare, color: 'emerald' },
  { id: 'safe_haven', label: 'Safe Havens', icon: Home, color: 'pink' },
];

/**
 * Filter bar for safety map resources
 */
const ResourceFilters = ({ selectedCategory, onSelectCategory, counts = {} }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const count = counts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
              isSelected
                ? 'bg-gradient-to-r from-brand-600 to-pinkAccent-600 text-white border-transparent shadow-soft-purple scale-[1.02]'
                : 'bg-navy-900 hover:bg-navy-850 text-slate-300 border-navy-750 hover:border-navy-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
            <span
              className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-navy-800 text-slate-400 border border-navy-700'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ResourceFilters;

