import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

const LoginPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-3xl bg-navy-900 border border-navy-800 shadow-soft-purple text-center space-y-6">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-900/60 border border-brand-700/40 flex items-center justify-center text-pinkAccent-400">
          <Lock className="w-6 h-6" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Sign In to SafeRoute</h2>
          <p className="text-xs text-slate-400">
            Authentication module (JWT, bcrypt, secure cookies/headers) will be wired in the upcoming step.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-navy-850 border border-navy-700/60 text-xs text-brand-300">
          🔒 Module 2 will activate this login form with email & password authentication.
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

