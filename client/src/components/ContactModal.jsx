import React, { useState, useEffect } from 'react';
import { X, User, Phone, Heart, Loader2, AlertCircle } from 'lucide-react';

const RELATIONSHIP_OPTIONS = [
  'Mother',
  'Father',
  'Guardian',
  'Sister',
  'Brother',
  'Friend',
  'Roommate',
  'Partner',
  'Colleague',
  'Other',
];

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

/**
 * Reusable modal for Creating and Editing a Trusted Contact.
 * Handles validation, submission states, and accessible escape-key dismiss.
 */
const ContactModal = ({ isOpen, onClose, onSave, contact = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'Guardian',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!contact;

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone: contact.phone || '',
        relationship: contact.relationship || 'Guardian',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        relationship: 'Guardian',
      });
    }
    setError('');
    setIsSubmitting(false);
  }, [contact, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter a valid contact name (at least 2 characters)');
      return;
    }

    if (!trimmedPhone || !PHONE_REGEX.test(trimmedPhone)) {
      setError('Please enter a valid phone number (e.g. +91 98765 43210 or 10 digits)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: trimmedName,
        phone: trimmedPhone,
        relationship: formData.relationship || 'Guardian',
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save contact. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-950/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 space-y-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pinkAccent-500 flex items-center justify-center text-white mb-3 shadow-soft-purple">
            <Heart className="w-5 h-5" />
          </div>
          <h2 id="modal-title" className="text-xl font-bold text-white tracking-tight">
            {isEditing ? 'Edit Trusted Guardian' : 'Add Trusted Guardian'}
          </h2>
          <p className="text-xs text-slate-400">
            {isEditing
              ? 'Update the contact information for this emergency recipient.'
              : 'Add someone you trust who will receive your SOS coordinates during an emergency.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start space-x-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
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
                placeholder="e.g. Geeta Sharma"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-60"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Phone Number *
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
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Include country code if applicable (+91 for India)</p>
          </div>

          {/* Relationship Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Relationship
            </label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-60"
            >
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel} className="bg-navy-900 text-white">
                  {rel}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-pinkAccent-600 hover:from-brand-500 hover:to-pinkAccent-500 text-white text-xs font-semibold shadow-soft-purple transition-all duration-200 flex items-center space-x-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Add Guardian'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ContactModal;

