import React, { useState, useEffect, useCallback } from 'react';
import { 
  BellRing, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Navigation, 
  Clock, 
  ExternalLink, 
  Radio, 
  Info,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useGeolocation from '../hooks/useGeolocation';

const EmergencySOSPage = () => {
  const { location, loading: geoLoading, error: geoError, permissionState, requestLocation } = useGeolocation();

  const [activeEvent, setActiveEvent] = useState(null);
  const [history, setHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [distressMessage, setDistressMessage] = useState('Immediate assistance requested. Please check my coordinates.');
  
  // UI states
  const [loadingData, setLoadingData] = useState(true);
  const [isConfirmingSOS, setIsConfirmingSOS] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [activeRes, historyRes, contactsRes] = await Promise.allSettled([
        api.get('/sos/active'),
        api.get('/sos/history'),
        api.get('/contacts'),
      ]);

      if (activeRes.status === 'fulfilled' && activeRes.value.data?.success) {
        setActiveEvent(activeRes.value.data.event);
      }
      if (historyRes.status === 'fulfilled' && historyRes.value.data?.success) {
        setHistory(historyRes.value.data.events || []);
      }
      if (contactsRes.status === 'fulfilled' && contactsRes.value.data?.success) {
        setContacts(contactsRes.value.data.contacts || []);
      }
    } catch (err) {
      console.warn('Error loading SOS hub data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-dismiss feedback banner
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Trigger SOS execution
  const executeSOS = async () => {
    setIsTriggering(true);
    setFeedback(null);

    let currentLat = location?.latitude || null;
    let currentLng = location?.longitude || null;
    let currentAcc = location?.accuracy || null;

    // If location is not yet acquired, try to request it once with brief timeout
    if (!currentLat) {
      try {
        const freshLocation = await requestLocation({ timeout: 5000 });
        currentLat = freshLocation.latitude;
        currentLng = freshLocation.longitude;
        currentAcc = freshLocation.accuracy;
      } catch (err) {
        // Location failed; proceed with null coordinates as safety fallback
        console.warn('SOS dispatched without GPS coordinates due to geolocation issue:', err.message);
      }
    }

    try {
      const response = await api.post('/sos', {
        latitude: currentLat,
        longitude: currentLng,
        accuracy: currentAcc,
        message: distressMessage,
      });

      if (response.data?.success) {
        const newEvent = response.data.event;
        setActiveEvent(newEvent);
        setHistory((prev) => [newEvent, ...prev.filter((e) => e._id !== newEvent._id)]);
        setIsConfirmingSOS(false);
        setFeedback({
          type: 'warning',
          title: 'Demo SOS Alert Created',
          message: 'Distress incident logged in Demo Mode. External emergency services and SMS were NOT dispatched.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message || 'Could not log emergency event.',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  // Resolve emergency event
  const handleResolve = async (id) => {
    setActionLoading(true);
    try {
      const response = await api.patch(`/sos/${id}/resolve`);
      if (response.data?.success) {
        setActiveEvent(null);
        setHistory((prev) =>
          prev.map((e) => (e._id === id ? response.data.event : e))
        );
        setFeedback({
          type: 'success',
          title: 'Emergency Resolved',
          message: 'The SOS incident has been successfully marked as resolved.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not resolve emergency event.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel emergency event
  const handleCancel = async (id) => {
    setActionLoading(true);
    try {
      const response = await api.patch(`/sos/${id}/cancel`);
      if (response.data?.success) {
        setActiveEvent(null);
        setHistory((prev) =>
          prev.map((e) => (e._id === id ? response.data.event : e))
        );
        setFeedback({
          type: 'info',
          title: 'Alert Cancelled',
          message: 'Emergency SOS alert was cancelled (marked as false alarm).',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not cancel emergency event.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner: Academic Demo Mode Indicator */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-brand-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-semibold text-white">SafeRoute Academic Demo Mode:</span>{' '}
            <span className="text-slate-300">
              SOS triggers create simulated database events with verified delivery audit logs. External police or SMS are not dispatched.
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-rose-300 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-lg flex-shrink-0 font-medium">
          <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
          <span>Real Crisis? Dial 112 / 1091</span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-start space-x-3 animate-fade-in ${
          feedback.type === 'error'
            ? 'bg-rose-950/80 border border-rose-800 text-rose-200'
            : feedback.type === 'warning'
            ? 'bg-amber-950/80 border border-amber-800 text-amber-200'
            : 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
        }`}>
          {feedback.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          ) : feedback.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">{feedback.title}</div>
            <p className="mt-0.5 opacity-90">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* ACTIVE SOS EMERGENCY BANNER (If an incident is currently ongoing) */}
      {activeEvent && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950 via-navy-900 to-rose-950/80 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/70 space-y-6 animate-pulse-slow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-500/50 text-xs font-bold text-rose-200 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping mr-1"></span>
                Active Emergency Event
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Distress Signal Broadcast In Progress
              </h2>
              <p className="text-xs text-rose-300">
                Triggered on {formatTime(activeEvent.createdAt)} • Mode: {activeEvent.alertMode.toUpperCase()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleResolve(activeEvent._id)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center space-x-2 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>I Am Safe (Resolve)</span>
              </button>

              <button
                onClick={() => handleCancel(activeEvent._id)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold border border-navy-700 transition-colors disabled:opacity-60"
              >
                <span>Cancel False Alarm</span>
              </button>
            </div>
          </div>

          {/* Active Event Metrics & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-navy-900/90 border border-navy-800 space-y-1">
              <span className="text-slate-400">Broadcast Coordinates</span>
              <div className="text-white font-mono font-bold">
                {activeEvent.latitude !== null && activeEvent.longitude !== null
                  ? `${activeEvent.latitude.toFixed(5)}, ${activeEvent.longitude.toFixed(5)}`
                  : 'Coordinates not provided (GPS off)'}
              </div>
              {activeEvent.accuracy && (
                <div className="text-[11px] text-slate-400">Accuracy: ±{activeEvent.accuracy} meters</div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-navy-900/90 border border-navy-800 space-y-1">
              <span className="text-slate-400">Delivery Status</span>
              <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Demo Logged (Simulated)</span>
              </div>
              <div className="text-[11px] text-slate-400">No external SMS billed or sent</div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-900/90 border border-navy-800 space-y-1">
              <span className="text-slate-400">Recipient Guardians</span>
              <div className="text-white font-bold">{activeEvent.deliveryDetails?.length || 0} Contacts Notified</div>
              <div className="text-[11px] text-slate-400">Audit logs preserved in incident history</div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO COLUMNS: Large SOS Button & Location Manager */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Large SOS Activation Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-navy-900 border border-navy-800 text-center relative overflow-hidden shadow-soft-purple">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-md mx-auto space-y-6 relative z-10">
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-pinkAccent-400">
                  Instant Emergency Broadcast
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Need Immediate Help?
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Triggering the SOS creates a high-priority distress event with your verified GPS coordinates and notifies your guardian circle.
                </p>
              </div>

              {/* The Central Circular SOS Button */}
              <div className="py-6 flex justify-center">
                <button
                  onClick={() => setIsConfirmingSOS(true)}
                  disabled={isTriggering || !!activeEvent}
                  className={`relative group w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
                    activeEvent
                      ? 'bg-navy-800 border-4 border-rose-500/50 cursor-not-allowed opacity-80'
                      : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-pinkAccent-500 hover:scale-105 active:scale-95 shadow-rose-600/40 hover:shadow-rose-600/60'
                  }`}
                  aria-label="Activate Emergency SOS"
                >
                  {/* Outer pulse wave */}
                  {!activeEvent && (
                    <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping group-hover:bg-rose-500/30"></span>
                  )}
                  <BellRing className={`w-12 h-12 text-white mb-2 ${!activeEvent && 'animate-bounce'}`} />
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-widest">
                    {activeEvent ? 'ACTIVE' : 'SOS'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100 mt-1">
                    {activeEvent ? 'Alert Ongoing' : 'Tap to Activate'}
                  </span>
                </button>
              </div>

              {/* Distress Message Input */}
              <div className="text-left space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Distress Note (Optional)
                </label>
                <input
                  type="text"
                  value={distressMessage}
                  onChange={(e) => setDistressMessage(e.target.value)}
                  placeholder="e.g. Unsafe situation, please call me"
                  disabled={isTriggering || !!activeEvent}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors disabled:opacity-50"
                />
              </div>

            </div>
          </div>

          {/* Current Geolocation Status Card */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-700/40 flex items-center justify-center text-brand-400 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Browser Geolocation GPS Status</h3>
                  <p className="text-xs text-slate-400">
                    Consent-first location sharing. Your GPS is only queried when you click locate.
                  </p>
                </div>
              </div>

              {/* Explicit Locate Button */}
              <button
                onClick={() => requestLocation()}
                disabled={geoLoading}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-semibold transition-colors flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-60"
              >
                {geoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                    <span>Locating GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-pinkAccent-400" />
                    <span>{location ? 'Refresh GPS' : 'Acquire My GPS'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Geolocation Details or Error Warning */}
            {geoError ? (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start space-x-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Geolocation Issue:</span> {geoError.message}
                </div>
              </div>
            ) : location ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60">
                  <span className="text-slate-400 block text-[11px]">Latitude</span>
                  <span className="text-white font-mono font-bold">{location.latitude.toFixed(6)}°</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60">
                  <span className="text-slate-400 block text-[11px]">Longitude</span>
                  <span className="text-white font-mono font-bold">{location.longitude.toFixed(6)}°</span>
                </div>
                <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60">
                  <span className="text-slate-400 block text-[11px]">Precision</span>
                  <span className="text-emerald-400 font-semibold">± {location.accuracy} meters</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-navy-850/60 border border-navy-700/40 text-xs text-slate-400 flex items-center justify-between">
                <span>GPS coordinates not acquired yet. Click "Acquire My GPS" to verify coordinate accuracy.</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Standby</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Guardian Circle & Helplines */}
        <div className="space-y-6">
          
          {/* Trusted Circle Quick-View */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-950 border border-brand-700/40 flex items-center justify-center text-pinkAccent-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Recipient Circle</h3>
              </div>
              <Link
                to="/contacts"
                className="text-xs text-pinkAccent-400 hover:text-pinkAccent-300 font-medium flex items-center"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              {contacts.length > 0
                ? `${contacts.length} guardian(s) will receive your emergency broadcast coordinates.`
                : 'No guardians configured! Add trusted contacts so they receive your location.'}
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="p-3 rounded-xl bg-navy-850 border border-navy-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{contact.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{contact.phone}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-900/60 text-brand-300 border border-brand-700/40">
                    {contact.relationship}
                  </span>
                </div>
              ))}
              {contacts.length === 0 && (
                <Link
                  to="/contacts"
                  className="block p-4 rounded-xl border border-dashed border-navy-700 text-center text-xs text-brand-400 hover:text-brand-300 hover:border-brand-500/50 transition-colors"
                >
                  + Add Trusted Guardian Contacts
                </Link>
              )}
            </div>
          </div>

          {/* Quick Dial Helplines */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800/40 flex items-center justify-center text-rose-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Emergency Direct Helplines</h3>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 transition-colors group"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-rose-300">112 — National Emergency</div>
                  <div className="text-[11px] text-slate-400">Police, Ambulance, Fire</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 font-mono font-bold text-xs">
                  Call 112
                </span>
              </a>

              <a
                href="tel:1091"
                className="flex items-center justify-between p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 transition-colors group"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-pinkAccent-300">1091 — Women Helpline</div>
                  <div className="text-[11px] text-slate-400">24/7 Dedicated Women Safety</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-pinkAccent-950 text-pinkAccent-300 font-mono font-bold text-xs">
                  Call 1091
                </span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* EMERGENCY INCIDENT AUDIT HISTORY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-navy-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-brand-400" />
              <span>Incident Audit & History</span>
            </h3>
            <p className="text-xs text-slate-400">
              Transparent, tamper-resistant log of all emergency events triggered from your account.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-navy-850 px-3 py-1 rounded-full border border-navy-700 w-fit">
            Total Logged: {history.length}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-2xl bg-navy-850/60 border border-navy-800 text-center text-xs text-slate-400">
            No emergency incidents recorded. System in normal standby mode.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((evt) => (
              <div
                key={evt._id}
                className="p-4 rounded-2xl bg-navy-850 border border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                      evt.status === 'active'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : evt.status === 'resolved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-navy-800 text-slate-400 border border-navy-700'
                    }`}>
                      {evt.status}
                    </span>
                    <span className="font-semibold text-white">{evt.message || 'Emergency SOS'}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex flex-wrap items-center gap-3">
                    <span>Logged: {formatTime(evt.createdAt)}</span>
                    <span>•</span>
                    <span>
                      GPS:{' '}
                      {evt.latitude !== null && evt.longitude !== null
                        ? `${evt.latitude.toFixed(4)}, ${evt.longitude.toFixed(4)} (±${evt.accuracy || 0}m)`
                        : 'Not available'}
                    </span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">Mode: {evt.alertMode}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {evt.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleResolve(evt._id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleCancel(evt._id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {evt.status === 'resolved' && (
                    <span className="text-emerald-400 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                  {evt.status === 'cancelled' && (
                    <span className="text-slate-400 font-medium flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelled</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL (Prevents Accidental SOS Clicks) */}
      {isConfirmingSOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-rose-800/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl shadow-rose-950/50">
            <div className="w-14 h-14 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shadow-soft-purple">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">
                Confirm Emergency SOS Trigger?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are about to broadcast an Emergency SOS distress event.
              </p>
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-pinkAccent-300 block">Demonstration Notice:</span>
                This creates an authentic database incident record and delivery audit in Demo Mode. External emergency services (police/ambulances) will not be dispatched.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingSOS(false)}
                disabled={isTriggering}
                className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-60"
              >
                No, Go Back
              </button>

              <button
                type="button"
                onClick={executeSOS}
                disabled={isTriggering}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pinkAccent-600 hover:from-rose-500 hover:to-pinkAccent-500 text-white text-xs font-bold shadow-soft-purple transition-all flex items-center space-x-2 disabled:opacity-60"
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <BellRing className="w-4 h-4 text-white" />
                    <span>Yes, Broadcast SOS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmergencySOSPage;

