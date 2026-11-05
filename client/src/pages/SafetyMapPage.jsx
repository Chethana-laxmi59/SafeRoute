import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  PhoneCall, 
  Compass, 
  Loader2, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import resourceService from '../services/resourceService';
import useGeolocation from '../hooks/useGeolocation';
import SafetyMap from '../components/map/SafetyMap';
import ResourceFilters from '../components/map/ResourceFilters';
import ResourceCard from '../components/map/ResourceCard';
import { formatDistance } from '../utils/distance';

const SafetyMapPage = () => {
  const { location, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [mapCenterOverride, setMapCenterOverride] = useState(null);

  // Fetch resources from backend API
  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (location?.latitude && location?.longitude) {
        params.lat = location.latitude;
        params.lng = location.longitude;
      }

      const data = await resourceService.getResources(params);
      if (data?.success) {
        setResources(data.resources || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load safety resources.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, location]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: resources.length, police: 0, hospital: 0, safe_haven: 0 };
    resources.forEach((r) => {
      if (counts[r.category] !== undefined) {
        counts[r.category]++;
      }
    });
    return counts;
  }, [resources]);

  // Filter resources by search query
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [resources, searchQuery]);

  // Handle selecting a resource from the list or marker
  const handleSelectResource = (resource) => {
    setSelectedResource(resource);
    setMapCenterOverride({
      latitude: resource.latitude,
      longitude: resource.longitude,
    });
  };

  // Identify closest resource when user coordinates are available
  const closestResource = useMemo(() => {
    if (!location || resources.length === 0) return null;
    const sorted = [...resources].filter((r) => r.distanceKm !== undefined);
    return sorted.length > 0 ? sorted[0] : null;
  }, [location, resources]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner: Header & GPS Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-brand-700/40 shadow-soft-purple">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/50 text-[11px] font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-pinkAccent-400" />
            <span>Geo-Assistance & Verified Shelters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interactive Safety Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Explore nearby emergency shelters, 24/7 women assistance desks, and hospital emergency wings with OpenStreetMap.
          </p>
        </div>

        {/* GPS Acquire Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => requestLocation()}
            disabled={geoLoading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-pinkAccent-600 hover:from-brand-500 hover:to-pinkAccent-500 text-white text-xs sm:text-sm font-semibold shadow-soft-purple transition-all duration-200 flex items-center space-x-2 disabled:opacity-60 flex-shrink-0"
          >
            {geoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-white" />
                <span>{location ? 'Refresh My GPS' : 'Acquire My GPS Location'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Academic Demonstration Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="text-slate-300">
            <strong className="text-white">Academic Demonstration Dataset:</strong> Map pins indicate simulated safety resources for capstone evaluation. For real-life emergencies, contact local police directly at <span className="text-pinkAccent-300 font-bold">112</span> or women helpline <span className="text-pinkAccent-300 font-bold">1091</span>.
          </div>
        </div>
        <div className="text-slate-400 text-[11px] flex-shrink-0">
          Source: SafeRoute Demonstration DB
        </div>
      </div>

      {/* Geolocation Warning (if permission denied or error) */}
      {geoError && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">GPS Note:</span> {geoError.message}{' '}
            <span className="opacity-80">You can still browse and pan across all safety resources on the map.</span>
          </div>
        </div>
      )}

      {/* Closest Resource Highlight Strip (If location acquired) */}
      {closestResource && (
        <div className="p-4 rounded-2xl bg-brand-950/70 border border-brand-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-900 border border-brand-700 flex items-center justify-center text-brand-300 flex-shrink-0">
              <MapPin className="w-4 h-4 text-pinkAccent-400" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Closest Assistance Point To You</span>
              <span className="text-white font-bold text-sm">{closestResource.name}</span>{' '}
              <span className="text-pinkAccent-300 font-bold font-mono">
                ({formatDistance(closestResource.distanceKm)})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSelectResource(closestResource)}
              className="px-3.5 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-semibold transition-colors"
            >
              Zoom on Map
            </button>
            <a
              href={`tel:${closestResource.phone}`}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Direct Call
            </a>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <ResourceFilters
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedResource(null);
          }}
          counts={categoryCounts}
        />

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, street..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-900 border border-navy-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* MAIN TWO-COLUMN MAP + SIDEBAR WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT 2/3 COLUMN: Interactive Leaflet Map */}
        <div className="lg:col-span-2 h-[500px] sm:h-[620px]">
          <SafetyMap
            resources={filteredResources}
            userLocation={location}
            selectedResource={selectedResource}
            onSelectResource={handleSelectResource}
            activeCenter={mapCenterOverride}
          />
        </div>

        {/* RIGHT 1/3 COLUMN: Searchable Resource List */}
        <div className="h-[500px] sm:h-[620px] flex flex-col p-5 rounded-3xl bg-navy-900 border border-navy-800 space-y-4">
          
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Nearby Safe Places</h3>
            </div>
            <span className="text-[11px] text-slate-400 bg-navy-850 px-2.5 py-0.5 rounded-full border border-navy-750 font-mono">
              {filteredResources.length} Found
            </span>
          </div>

          {/* Scrollable list */}
          <div className="flex-grow overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="min-h-[250px] flex flex-col items-center justify-center space-y-3 text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                <span>Loading safety resources...</span>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 space-y-2 text-xs text-slate-400">
                <Compass className="w-8 h-8 text-slate-600 mb-1" />
                <div className="text-white font-semibold">No Resources Found</div>
                <p>Try switching category filters or clearing your search term.</p>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <ResourceCard
                  key={resource._id || resource.id}
                  resource={resource}
                  isSelected={selectedResource?._id === resource._id}
                  onSelect={handleSelectResource}
                />
              ))
            )}
          </div>

          {/* Quick Helpline Strip at Sidebar Bottom */}
          <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3 h-3 text-rose-400" />
              <span>Helpline: 112 / 1091</span>
            </span>
            <span className="text-pinkAccent-400 font-medium">SafeRoute Map</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SafetyMapPage;

