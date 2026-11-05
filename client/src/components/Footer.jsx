import React from 'react';
import { Shield, Heart, ExternalLink, AlertOctagon, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Platform footer with emergency numbers, site navigation, and ethical disclaimer.
 */
const Footer = () => {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-pinkAccent-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SafeRoute</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An intelligent, responsive emergency assistance and safety navigation system built to empower women with rapid response protocols and trusted contact networks.
            </p>
            <div className="text-xs text-slate-500">
              College Capstone Engineering Project
            </div>
          </div>

          {/* Core Modules Planned */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Platform Modules</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-pinkAccent-400 cursor-pointer transition-colors">Instant SOS Broadcast</li>
              <li className="hover:text-pinkAccent-400 cursor-pointer transition-colors">Trusted Contacts Directory</li>
              <li className="hover:text-pinkAccent-400 cursor-pointer transition-colors">Interactive Safety Map</li>
              <li className="hover:text-pinkAccent-400 cursor-pointer transition-colors">Safe Route Guidance</li>
              <li className="hover:text-pinkAccent-400 cursor-pointer transition-colors">Audit & Incident History</li>
            </ul>
          </div>

          {/* Emergency Helplines Reference */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>National Helplines (India)</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800">
                <div className="text-white font-medium">112</div>
                <div className="text-slate-400 text-[11px]">All-in-One Emergency Service</div>
              </div>
              <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800">
                <div className="text-white font-medium">1091 / 181</div>
                <div className="text-slate-400 text-[11px]">Women Helpline (Domestic & Public)</div>
              </div>
            </div>
          </div>

          {/* Technology & Architecture */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Architecture</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• React 18 + Vite</li>
              <li>• Tailwind CSS Design System</li>
              <li>• Node.js & Express REST API</li>
              <li>• MongoDB Atlas & Mongoose</li>
              <li>• Leaflet & OpenStreetMap</li>
              <li>• JWT Secure Authentication</li>
            </ul>
          </div>
        </div>

        {/* Ethical Safety & Demo Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-navy-900/80 border border-amber-500/30 mb-8 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-xs">
          <AlertOctagon className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-slate-300">
            <span className="font-semibold text-amber-300">Important Safety Disclaimer:</span> SafeRoute is an academic web platform. SOS triggers within this demo mode send simulated alerts unless configured with active SMS / Twilio credentials. In an actual emergency situation, always contact government emergency services (112 / 911 / 100) immediately.
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-3 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} SafeRoute Platform. Designed with care for women safety.
          </div>
          <div className="flex items-center space-x-1">
            <span>Built with precision for Engineering Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

