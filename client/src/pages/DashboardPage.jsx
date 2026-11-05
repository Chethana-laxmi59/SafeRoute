import React from 'react';
import { 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  BellRing, 
  MapPin, 
  LogOut, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return 'Active';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Active';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-brand-700/40 shadow-soft-purple relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/50 text-[11px] font-semibold text-brand-300">
              <Sparkles className="w-3.5 h-3.5 text-pinkAccent-400" />
              <span>SafeRoute Emergency Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name || 'Guardian'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Your personal emergency dashboard is active. In the upcoming modules, you will configure your trusted contact circle and live GPS broadcast.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={logout}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-rose-300 border border-rose-900/40 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: User Profile & Safety Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Profile Card */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-navy-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-pinkAccent-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{user?.name}</h2>
              <span className="text-xs text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1"></span>
                Authenticated Profile
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-850">
              <div className="flex items-center space-x-2 text-slate-400">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>Email</span>
              </div>
              <span className="text-white font-medium truncate max-w-[180px]">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-850">
              <div className="flex items-center space-x-2 text-slate-400">
                <Phone className="w-4 h-4 text-pinkAccent-400" />
                <span>Phone</span>
              </div>
              <span className="text-white font-medium">{user?.phone || 'Not configured'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-850">
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Member Since</span>
              </div>
              <span className="text-white font-medium">{formatDate(user?.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-850">
              <div className="flex items-center space-x-2 text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Security</span>
              </div>
              <span className="text-emerald-300 font-medium">Bcrypt Hashed & JWT</span>
            </div>
          </div>
        </div>

        {/* Phase 3 Roadmap Banner: Trusted Contacts */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-700/50 flex items-center justify-center text-brand-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-900/60 text-brand-300 border border-brand-700/50">
                Module 3 Target
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trusted Contacts Circle</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Your emergency contacts will receive automated SOS alerts and GPS coordinates when triggered.
            </p>
            <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/70 text-xs text-slate-300 space-y-1.5">
              <div className="font-semibold text-pinkAccent-300">Contacts Configured: 0</div>
              <p className="text-[11px] text-slate-400">
                We will implement Trusted Contacts CRUD in the next module with priority ranking and relationship tags.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-navy-800 text-slate-400 text-xs font-semibold cursor-not-allowed border border-navy-700 flex items-center justify-center space-x-1"
            >
              <span>Add Contacts (Available in Phase 3)</span>
            </button>
          </div>
        </div>

        {/* Phase 4 Roadmap Banner: Instant SOS Dispatcher */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700/50 flex items-center justify-center text-rose-400">
                <BellRing className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                Module 4 Target
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Emergency SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              One-touch distress broadcast system with explicit user location consent and real-time delivery confirmation.
            </p>
            <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/70 text-xs text-slate-300 space-y-1.5">
              <div className="font-semibold text-rose-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                <span>Standby Status</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Requires trusted contacts setup (Phase 3) before live dispatch activation.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-rose-950/40 text-rose-400 text-xs font-semibold cursor-not-allowed border border-rose-800/40 flex items-center justify-center space-x-1"
            >
              <span>SOS Dispatcher (Available in Phase 4)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Safety Helplines Quick Reminder */}
      <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/50 border border-rose-800/50 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Emergency Hotline Quick Dial</h4>
            <p className="text-xs text-slate-400">For life-threatening crisis situations, call 112 or 1091 directly.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-lg bg-navy-850 border border-navy-700 text-xs font-mono font-bold text-white">
            Dial: 112
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-navy-850 border border-navy-700 text-xs font-mono font-bold text-pinkAccent-300">
            Women Helpline: 1091
          </span>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;

