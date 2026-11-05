import React, { useState } from 'react';
import { Shield, Menu, X, PhoneCall, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Main application navigation bar.
 * Responsive with mobile hamburger menu and quick emergency numbers indicator.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy-900/90 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pinkAccent-500 flex items-center justify-center shadow-soft-purple group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-pinkAccent-100 to-brand-300 bg-clip-text text-transparent">
                SafeRoute
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-900/60 text-brand-300 border border-brand-700/50">
                Safety & Emergency
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#demo-notice" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Safety Protocol
            </a>
            
            {/* National Emergency Hotline badge */}
            <div className="flex items-center space-x-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-lg">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>National Helpline: <strong className="text-white font-semibold">112</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-pinkAccent-600 hover:from-brand-500 hover:to-pinkAccent-500 px-4 py-2 rounded-lg shadow-sm hover:shadow-soft-purple transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-800 px-4 pt-3 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-navy-800 hover:text-white"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-navy-800 hover:text-white"
          >
            How It Works
          </a>
          <a
            href="#demo-notice"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-navy-800 hover:text-white"
          >
            Safety Protocol
          </a>

          <div className="pt-2 border-t border-navy-800 flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 px-3 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Emergency Services: Dial <strong>112 / 1091</strong> directly</span>
            </div>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-navy-800 hover:bg-navy-700"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-pinkAccent-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

