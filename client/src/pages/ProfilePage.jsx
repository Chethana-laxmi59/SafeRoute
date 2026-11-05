import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Sparkles,
  HeartHandshake,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Account metrics
  const [stats, setStats] = useState({
    contactsCount: 0,
    incidentsCount: 0,
    loadingStats: true,
  });

  // Pre-fill form when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Fetch account overview metrics
  useEffect(() => {
    const fetchAccountMetrics = async () => {
      try {
        const [contactsRes, sosRes] = await Promise.allSettled([
          api.get('/contacts'),
          api.get('/sos/history'),
        ]);

        const cCount = contactsRes.status === 'fulfilled' ? contactsRes.value.data?.count || 0 : 0;
        const sCount = sosRes.status === 'fulfilled' ? sosRes.value.data?.count || 0 : 0;

        setStats({
          contactsCount: cCount,
          incidentsCount: sCount,
          loadingStats: false,
        });
      } catch (e) {
        setStats((prev) => ({ ...prev, loadingStats: false }));
      }
    };

    fetchAccountMetrics();
  }, []);

  // Clear messages on input change
  const handleChange = (e) => {
    setSuccessMsg('');
    setErrorMsg('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Full Name must be at least 2 characters long');
      return;
    }

    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      setErrorMsg('Please provide a valid phone number (e.g. +91 98765 43210 or 10 digits)');
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile({
      name: trimmedName,
      phone: trimmedPhone,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Your profile was updated successfully.');
    } else {
      setErrorMsg(result.error || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Active Member';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Active Member';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-brand-700/40 shadow-soft-purple flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/50 text-[11px] font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-pinkAccent-400" />
            <span>Account & Identity Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Profile & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Manage your personal profile details, verified emergency contact number, and account security settings.
          </p>
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-rose-300 border border-rose-900/40 text-xs font-semibold transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Edit Profile Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-navy-900 border border-navy-800 space-y-6">
          
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Personal Information</h3>
            <p className="text-xs text-slate-400">
              Update how your name appears on your guardian circle and emergency distress logs.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 flex items-center space-x-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200 flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Email Address (Immutable in basic profile) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <span className="text-[10px] text-slate-500 uppercase">Registered Identifier</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 text-sm cursor-not-allowed select-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                To modify your primary account email, please contact platform administrators.
              </p>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Primary Emergency Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-60"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                This number is attached to your SOS broadcasts so emergency services can reach you.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-pinkAccent-600 hover:from-brand-500 hover:to-pinkAccent-500 text-white text-xs sm:text-sm font-semibold shadow-soft-purple transition-all flex items-center space-x-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: Account Security & Statistics */}
        <div className="space-y-6">
          
          {/* Identity Badge Card */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 space-y-4 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-brand-600 to-pinkAccent-600 flex items-center justify-center text-white font-black text-3xl shadow-soft-purple">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            </div>
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified SafeRoute Account</span>
            </div>
          </div>

          {/* Account Metrics Summary */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 space-y-3 text-xs">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider mb-2">
              Account Activity
            </h4>

            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850">
              <span className="text-slate-400">Guardian Contacts</span>
              <span className="font-bold text-white font-mono">
                {stats.loadingStats ? '...' : `${stats.contactsCount} Active`}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850">
              <span className="text-slate-400">SOS Incidents Recorded</span>
              <span className="font-bold text-white font-mono">
                {stats.loadingStats ? '...' : `${stats.incidentsCount} Total`}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850">
              <span className="text-slate-400">Registration Date</span>
              <span className="font-medium text-slate-300">
                {formatDate(user?.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850">
              <span className="text-slate-400">Credential Encryption</span>
              <span className="font-semibold text-emerald-400">
                Bcrypt (Salt 10)
              </span>
            </div>
          </div>

          {/* Security Best Practice Card */}
          <div className="p-5 rounded-3xl bg-navy-900/60 border border-navy-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-2 text-pinkAccent-300 font-bold">
              <Lock className="w-4 h-4" />
              <span>Session & Privacy Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Your session is protected via stateless JSON Web Tokens (JWT). Coordinates and personal contact lists are never indexed publicly or shared with third-party tracking networks.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;

