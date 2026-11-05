import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  Search, 
  Loader2, 
  ExternalLink, 
  Radio, 
  PhoneCall, 
  Sparkles, 
  X,
  Eye,
  AlertTriangle,
  Users
} from 'lucide-react';
import api from '../services/api';

const IncidentHistoryPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Sorting
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'resolved' | 'cancelled'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Selected Incident for Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all user emergency events
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/sos/history');
      if (response.data?.success) {
        setIncidents(response.data.events || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve emergency incident history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle resolving an incident directly
  const handleResolve = async (id) => {
    setActionLoading(true);
    try {
      const response = await api.patch(`/sos/${id}/resolve`);
      if (response.data?.success) {
        setIncidents((prev) =>
          prev.map((e) => (e._id === id ? response.data.event : e))
        );
        setSelectedIncident(response.data.event);
      }
    } catch (err) {
      alert(err.message || 'Failed to resolve incident');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancelling an incident directly
  const handleCancel = async (id) => {
    setActionLoading(true);
    try {
      const response = await api.patch(`/sos/${id}/cancel`);
      if (response.data?.success) {
        setIncidents((prev) =>
          prev.map((e) => (e._id === id ? response.data.event : e))
        );
        setSelectedIncident(response.data.event);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel incident');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'N/A';
    }
  };

  // Status counts
  const counts = useMemo(() => {
    const res = { all: incidents.length, active: 0, resolved: 0, cancelled: 0 };
    incidents.forEach((i) => {
      if (res[i.status] !== undefined) res[i.status]++;
    });
    return res;
  }, [incidents]);

  // Filtered and sorted incidents
  const filteredIncidents = useMemo(() => {
    let result = [...incidents];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }

    // Start date filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((i) => new Date(i.createdAt).getTime() >= start);
    }

    // End date filter (inclusive of the whole day)
    if (endDate) {
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      result = result.filter((i) => new Date(i.createdAt).getTime() <= end);
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [incidents, statusFilter, startDate, endDate, sortOrder]);

  const clearFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setSortOrder('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-brand-700/40 shadow-soft-purple">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/50 text-[11px] font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-pinkAccent-400" />
            <span>Tamper-Resistant Incident Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Emergency Incident History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            A complete, auditable timeline of distress broadcasts activated from your account. Each event logs coordinates, accuracy, recipient contacts, and verified resolution states.
          </p>
        </div>
      </div>

      {/* Academic Demo Notice */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="text-slate-300">
            <strong className="text-white">Audit Delivery Integrity:</strong> All historical events reflect Demo Mode. In this demonstration mode, simulated alerts are logged to the database and no external police or paid SMS broadcasts were dispatched.
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-rose-300 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-lg flex-shrink-0 font-medium">
          <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
          <span>Real Emergency: Dial 112</span>
        </div>
      </div>

      {/* Filter and Sorting Controls Toolbar */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 space-y-4">
        
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Incidents', count: counts.all },
            { id: 'active', label: 'Active', count: counts.active },
            { id: 'resolved', label: 'Resolved', count: counts.resolved },
            { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white border-transparent shadow-sm'
                  : 'bg-navy-850 hover:bg-navy-800 text-slate-300 border-navy-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-navy-950/60 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Date Filters & Sorting Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs pt-1 border-t border-navy-800">
          
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Sorting Order */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Sort By
            </label>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="newest" className="bg-navy-900 text-white">Newest First</option>
                <option value="oldest" className="bg-navy-900 text-white">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full py-1.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>

        </div>

      </div>

      {/* Main Incident Cards List */}
      {loading ? (
        <div className="min-h-[280px] flex flex-col items-center justify-center space-y-3 text-xs text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          <span>Loading incident registry...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-rose-950/50 border border-rose-800 text-xs text-rose-200">
          {error}
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900 border border-navy-800 text-center space-y-3 max-w-lg mx-auto text-xs text-slate-400">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No Incidents Found</h3>
          <p>
            {incidents.length === 0
              ? 'Your account has no recorded emergency incidents. System is in normal standby.'
              : 'No incidents match your selected filters. Try resetting the status or date filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const hasGps = incident.latitude !== null && incident.longitude !== null;

            return (
              <div
                key={incident._id}
                onClick={() => setSelectedIncident(incident)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs group ${
                  incident.status === 'active'
                    ? 'bg-rose-950/30 border-rose-800/80 hover:border-rose-500 shadow-lg shadow-rose-950/20'
                    : 'bg-navy-900 border-navy-800 hover:border-brand-500/50 hover:bg-navy-850/80 shadow-sm'
                }`}
              >
                {/* Left: Metadata & Status */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400 bg-navy-850 px-2.5 py-0.5 rounded-md border border-navy-750">
                      #{incident._id.slice(-6).toUpperCase()}
                    </span>

                    <span
                      className={`inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        incident.status === 'active'
                          ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                          : incident.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-navy-800 text-slate-400 border-navy-700'
                      }`}
                    >
                      {incident.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block mr-1"></span>}
                      {incident.status}
                    </span>

                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full">
                      Mode: {incident.alertMode}
                    </span>

                    <span className="text-slate-400 text-[11px]">
                      {formatDate(incident.createdAt)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-pinkAccent-200 transition-colors">
                    {incident.message || 'Emergency SOS Distress Broadcast'}
                  </h4>

                  {/* Coordinates indicator */}
                  <div className="flex items-center space-x-2 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                    {hasGps ? (
                      <span className="text-slate-300 font-mono">
                        GPS: {incident.latitude.toFixed(5)}°, {incident.longitude.toFixed(5)}° (±{incident.accuracy || 0}m)
                      </span>
                    ) : (
                      <span className="text-amber-400/90 italic">
                        GPS coordinates were unavailable during this SOS event
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Recipients & View button */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-navy-800">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Guardians Audited</span>
                    <span className="text-white font-bold">{incident.deliveryDetails?.length || 0} Contacts</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIncident(incident);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 font-medium transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-400" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED INCIDENT MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedIncident(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-brand-400 font-bold">
                  Incident ID: #{selectedIncident._id}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    selectedIncident.status === 'active'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : selectedIncident.status === 'resolved'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-navy-800 text-slate-400 border-navy-700'
                  }`}
                >
                  {selectedIncident.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {selectedIncident.message || 'Emergency SOS Distress Incident'}
              </h3>
            </div>

            {/* Timeline Breakdown */}
            <div className="p-3.5 rounded-2xl bg-navy-850 border border-navy-750 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Triggered At:</span>
                <span className="text-white font-medium">{formatDate(selectedIncident.createdAt)}</span>
              </div>
              {selectedIncident.resolvedAt && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Resolved Safe At:</span>
                  <span className="font-medium">{formatDate(selectedIncident.resolvedAt)}</span>
                </div>
              )}
              {selectedIncident.cancelledAt && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cancelled At:</span>
                  <span className="font-medium">{formatDate(selectedIncident.cancelledAt)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-navy-750">
                <span className="text-slate-400">Alert Mode:</span>
                <span className="text-amber-400 font-bold uppercase">{selectedIncident.alertMode} Mode</span>
              </div>
            </div>

            {/* Location Section */}
            <div className="p-3.5 rounded-2xl bg-navy-850 border border-navy-750 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-pinkAccent-400" />
                <span>Distress Geolocation Coordinates</span>
              </div>
              {selectedIncident.latitude !== null && selectedIncident.longitude !== null ? (
                <div className="space-y-1">
                  <div className="font-mono text-white font-bold">
                    {selectedIncident.latitude.toFixed(6)}°, {selectedIncident.longitude.toFixed(6)}°
                  </div>
                  {selectedIncident.accuracy && (
                    <div className="text-[11px] text-slate-400">GPS Accuracy: ±{selectedIncident.accuracy} meters</div>
                  )}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selectedIncident.latitude}&mlon=${selectedIncident.longitude}#map=16/${selectedIncident.latitude}/${selectedIncident.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] text-brand-400 hover:text-brand-300 font-medium pt-1"
                  >
                    <span>View on OpenStreetMap</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-amber-400 text-[11px] leading-relaxed">
                  GPS coordinates were unavailable during this SOS event. The user may have denied location permissions or GPS signal was not yet locked.
                </p>
              )}
            </div>

            {/* Recipient Audit Log */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-white flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-brand-400" />
                <span>Guardian Recipient Delivery Breakdown</span>
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedIncident.deliveryDetails?.map((detail, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-navy-850 border border-navy-750 space-y-1 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{detail.name}</span>
                      <span className="text-[10px] text-amber-400 font-semibold uppercase">
                        {detail.status}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono">{detail.phone}</div>
                    <div className="text-slate-400 text-[10px]">{detail.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons if Active */}
            {selectedIncident.status === 'active' && (
              <div className="pt-3 border-t border-navy-800 flex items-center justify-end space-x-3">
                <button
                  onClick={() => handleCancel(selectedIncident._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold"
                >
                  Cancel False Alarm
                </button>
                <button
                  onClick={() => handleResolve(selectedIncident._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Am Safe (Resolve)</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default IncidentHistoryPage;
