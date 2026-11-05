import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertCircle, 
  Users, 
  MapPin, 
  BellRing, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Eye, 
  PhoneCall, 
  Radio, 
  HeartHandshake, 
  HelpCircle,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/**
 * SafeRoute Landing Page
 * Displays core system capabilities, emergency hotline references, 
 * live backend communication status, and safety architecture overview.
 */
const LandingPage = () => {
  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    online: false,
    data: null,
    error: null
  });

  // Test backend connectivity via environment variable on mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await api.get('/health');
        setBackendStatus({
          checked: true,
          online: true,
          data: response.data,
          error: null
        });
      } catch (err) {
        setBackendStatus({
          checked: true,
          online: false,
          data: null,
          error: err.message
        });
      }
    };

    checkServerHealth();
  }, []);

  const features = [
    {
      icon: BellRing,
      title: 'One-Tap Emergency SOS',
      desc: 'Instantly notify designated trusted contacts with your GPS coordinates and an automated distress signal with clear delivery confirmation.',
      badge: 'Critical Feature'
    },
    {
      icon: Users,
      title: 'Trusted Guardian Circle',
      desc: 'Add, update, and manage your verified inner circle who receive emergency alerts and real-time updates when an incident is reported.',
      badge: 'Guardian Network'
    },
    {
      icon: MapPin,
      title: 'Interactive Safety Map',
      desc: 'Locate verified 24/7 safe havens, nearby police stations, women help kiosks, and hospital emergency wings with OpenStreetMap.',
      badge: 'Geo-Assistance'
    },
    {
      icon: Lock,
      title: 'Consent-First Location Sharing',
      desc: 'Your real-time location is never tracked or shared without your explicit consent. You remain in complete control of your privacy.',
      badge: 'Privacy Shield'
    },
    {
      icon: Eye,
      title: 'Auditable Incident Log',
      desc: 'Every SOS dispatch creates a timestamped record with delivery status, resolved state, and coordinates for post-incident review.',
      badge: 'Event Tracking'
    },
    {
      icon: HeartHandshake,
      title: 'Safety Knowledge & Protocols',
      desc: 'Access actionable self-defense strategies, legal rights summaries, and preventative safety advice tailored for students and commuters.',
      badge: 'Awareness'
    }
  ];

  const helplines = [
    { number: '112', title: 'National Emergency', desc: 'Unified Police, Fire & Medical hotline' },
    { number: '1091', title: 'Women Safety Helpline', desc: 'Dedicated 24/7 women emergency line' },
    { number: '181', title: 'Women in Distress', desc: 'National commission for women support' },
    { number: '1090', title: 'Women Power Line', desc: 'Harassment & cyber safety assistance' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Your Profile',
      desc: 'Register an account and configure your vital details and emergency preferences.'
    },
    {
      step: '02',
      title: 'Add Trusted Contacts',
      desc: 'Specify phone numbers and relationships of family members, friends, or roommates.'
    },
    {
      step: '03',
      title: 'Grant Location Access',
      desc: 'Enable browser geolocation so the platform can pinpoint you accurately during an alert.'
    },
    {
      step: '04',
      title: 'Activate Instant SOS',
      desc: 'In distress, trigger the emergency broadcast button for immediate coordinate dispatch.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Backend Connectivity Banner */}
      <div className="bg-navy-900 border-b border-navy-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Server className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-slate-400">System Integration:</span>
            {backendStatus.checked ? (
              backendStatus.online ? (
                <span className="inline-flex items-center text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
                  Backend Connected ({backendStatus.data?.platform} v{backendStatus.data?.version})
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1.5"></span>
                  Backend Offline (Start server to connect)
                </span>
              )
            ) : (
              <span className="text-slate-400">Checking API link...</span>
            )}
          </div>
          <div className="text-slate-400 hidden sm:block">
            College Capstone • MERN Stack Architecture
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-pinkAccent-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Header */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-800/80 border border-brand-500/30 text-xs font-medium text-pinkAccent-300">
              <Sparkles className="w-3.5 h-3.5 text-pinkAccent-400" />
              <span>Smart Emergency Assistance & Safety Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Safety, empowerment, and <span className="bg-gradient-to-r from-pinkAccent-400 via-brand-400 to-purple-300 bg-clip-text text-transparent">peace of mind</span> on every route.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              SafeRoute provides modern women with immediate emergency SOS dispatches, verified guardian circle communication, permission-based real-time tracking, and interactive safety resources.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-pinkAccent-600 hover:from-brand-500 hover:to-pinkAccent-500 text-white font-semibold shadow-soft-purple transition-all duration-200 group"
              >
                <span>Set Up Safety Network</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-navy-800/90 hover:bg-navy-700 text-slate-200 border border-navy-700 font-semibold transition-colors"
              >
                Explore How It Works
              </a>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Explicit Location Consent</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Transparent Delivery Status</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400" />
                <span>Zero Mock Data Claims</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Emergency Helplines Quick-Access Strip */}
      <section className="bg-navy-900/60 border-y border-navy-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-pinkAccent-400" />
                <span>Immediate Emergency Helplines</span>
              </h3>
              <p className="text-xs text-slate-400">Toll-free, 24/7 government safety numbers for instant crisis response</p>
            </div>
            <span className="text-xs text-slate-400 bg-navy-800 px-3 py-1 rounded-full border border-navy-700 w-fit">
              Official Indian Emergency Services
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {helplines.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-navy-850 border border-navy-700/80 hover:border-pinkAccent-500/50 transition-all duration-200 group"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-black text-pinkAccent-400 group-hover:text-pinkAccent-300">
                    {item.number}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-navy-900 px-2 py-0.5 rounded">
                    Toll-Free
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-pinkAccent-400">
              Built for Rapid Intervention
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A comprehensive safety architecture
            </p>
            <p className="text-sm text-slate-400">
              Engineered to combine modern web standards, geolocation precision, and reliable communication pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-navy-900 border border-navy-800 hover:border-brand-500/40 hover:bg-navy-850/70 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-soft-purple"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-brand-950/80 border border-brand-700/50 flex items-center justify-center text-brand-300 group-hover:text-pinkAccent-300 group-hover:border-pinkAccent-500/50 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-navy-800 text-slate-300 border border-navy-700">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pinkAccent-100 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-navy-800/80 flex items-center text-xs text-brand-400 font-medium group-hover:text-pinkAccent-300 transition-colors">
                    <span>Module planned for Phase 2</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* How It Works (Step-by-Step Flow) */}
      <section id="how-it-works" className="py-16 bg-navy-900/40 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-400">Workflow</h2>
            <h3 className="text-3xl font-extrabold text-white">How SafeRoute operates</h3>
            <p className="text-xs sm:text-sm text-slate-400">Simple, fail-safe, and designed for low latency under stress.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((st, i) => (
              <div key={i} className="p-6 rounded-2xl bg-navy-850 border border-navy-700/60 relative">
                <span className="text-3xl font-black text-brand-500/30 font-mono mb-3 block">
                  {st.step}
                </span>
                <h4 className="text-base font-bold text-white mb-2">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Demo Mode & Safety Ethics Protocol */}
      <section id="demo-notice" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-brand-700/40 shadow-soft-purple">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">
                  College Project Safety & Ethical Disclosure
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  As part of our commitment to responsible engineering and software transparency, SafeRoute clearly distinguishes between <strong>Simulated Academic Demonstration</strong> and <strong>Live Production Emergency Dispatch</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                    <span className="font-semibold text-pinkAccent-300 block mb-1">Demonstration Mode (Default)</span>
                    <p className="text-slate-400 leading-normal">
                      SOS triggers generate real database events, trigger real frontend alerts, and test coordinate delivery, but do NOT dispatch live police or external emergency vehicles.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                    <span className="font-semibold text-brand-300 block mb-1">Live SMS/Twilio Integration (Optional)</span>
                    <p className="text-slate-400 leading-normal">
                      Actual SMS dispatch to real phone numbers only executes when authentic API credentials (e.g. Twilio SID & Auth Token) are provided in the backend configuration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900/80 via-navy-900 to-pinkAccent-900/40 border border-pinkAccent-500/30 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to explore SafeRoute?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Follow along as we implement the next modules: authentication, trusted contacts CRUD, and the live OpenStreetMap integration.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-navy-950 font-bold hover:bg-slate-100 transition-colors shadow-lg"
              >
                Sign Up for Access
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-navy-800/80 hover:bg-navy-800 text-white font-medium border border-navy-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

