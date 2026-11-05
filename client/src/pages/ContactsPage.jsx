import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Phone, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  PhoneCall,
  Search,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import ContactModal from '../components/ContactModal';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Search / filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Delete confirmation modal state
  const [deletingContact, setDeletingContact] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/contacts');
      if (response.data?.success) {
        setContacts(response.data.contacts || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your trusted contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Open modal to add
  const handleOpenAdd = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  // Open modal to edit
  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  // Save contact (add or update)
  const handleSaveContact = async (contactData) => {
    if (editingContact) {
      // Update
      const response = await api.put(`/contacts/${editingContact._id}`, contactData);
      if (response.data?.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === editingContact._id ? response.data.contact : c))
        );
        setSuccessMessage(`Guardian "${contactData.name}" updated successfully.`);
      }
    } else {
      // Create
      const response = await api.post('/contacts', contactData);
      if (response.data?.success) {
        setContacts((prev) => [response.data.contact, ...prev]);
        setSuccessMessage(`Guardian "${contactData.name}" added to your circle.`);
      }
    }
  };

  // Delete contact confirmation
  const handleConfirmDelete = async () => {
    if (!deletingContact) return;
    setIsDeleting(true);
    try {
      await api.delete(`/contacts/${deletingContact._id}`);
      setContacts((prev) => prev.filter((c) => c._id !== deletingContact._id));
      setSuccessMessage(`Guardian "${deletingContact.name}" was removed.`);
      setDeletingContact(null);
    } catch (err) {
      setError(err.message || 'Failed to remove contact.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.relationship && c.relationship.toLowerCase().includes(q))
    );
  });

  // Badge style helper
  const getBadgeStyle = (relationship) => {
    const rel = (relationship || '').toLowerCase();
    if (['mother', 'father', 'parent'].includes(rel)) {
      return 'bg-brand-900/70 text-brand-300 border-brand-700/50';
    }
    if (['friend', 'roommate', 'sister', 'brother'].includes(rel)) {
      return 'bg-pinkAccent-900/60 text-pinkAccent-300 border-pinkAccent-700/50';
    }
    if (['partner', 'husband', 'wife'].includes(rel)) {
      return 'bg-rose-950 text-rose-300 border-rose-800/50';
    }
    return 'bg-navy-800 text-slate-300 border-navy-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-brand-700/40 shadow-soft-purple relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/50 text-[11px] font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-pinkAccent-400" />
            <span>Emergency Guardian Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trusted Contacts Circle
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            When you trigger an Emergency SOS, these verified guardians receive an immediate distress alert with your real-time coordinates.
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-pinkAccent-600 hover:from-brand-500 hover:to-pinkAccent-500 text-white text-xs sm:text-sm font-semibold shadow-soft-purple transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Guardian</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between">
          <div>
            <div className="text-slate-400 mb-0.5">Active Circle Size</div>
            <div className="text-2xl font-black text-white">{contacts.length} / 5 recommended</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-700/40 flex items-center justify-center text-brand-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between">
          <div>
            <div className="text-slate-400 mb-0.5">SOS Broadcast Readiness</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{contacts.length > 0 ? 'Armed & Ready' : 'Add at least 1 contact'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between">
          <div>
            <div className="text-slate-400 mb-0.5">National Emergency Hotline</div>
            <div className="text-sm font-bold text-rose-400 mt-1">Dial 112 (Immediate Response)</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800/40 flex items-center justify-center text-rose-400">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 flex items-center space-x-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      {contacts.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guardians by name, phone or relation..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Showing {filteredContacts.length} of {contacts.length} guardians
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 rounded-2xl bg-navy-900 border border-navy-800 animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-navy-800"></div>
                <div className="space-y-2 flex-grow">
                  <div className="w-3/4 h-4 bg-navy-800 rounded"></div>
                  <div className="w-1/2 h-3 bg-navy-800 rounded"></div>
                </div>
              </div>
              <div className="h-9 bg-navy-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        // Empty State Card
        <div className="p-10 sm:p-14 rounded-3xl bg-navy-900 border border-navy-800 text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-950 border border-brand-700/40 flex items-center justify-center text-pinkAccent-400 shadow-soft-purple">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Your Guardian Circle is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Add at least 1 to 3 trusted people (parents, siblings, roommates, or mentors). During an emergency, they will receive your immediate distress coordinates.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-pinkAccent-600 hover:from-brand-500 hover:to-pinkAccent-500 text-white text-xs font-semibold shadow-soft-purple transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Your First Guardian</span>
            </button>
          </div>
        </div>
      ) : filteredContacts.length === 0 ? (
        // No Search Results
        <div className="p-8 rounded-2xl bg-navy-900 border border-navy-800 text-center text-xs text-slate-400">
          No guardians found matching "{searchQuery}".
        </div>
      ) : (
        // Contacts Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="p-6 rounded-2xl bg-navy-900 border border-navy-800 hover:border-brand-500/40 transition-all duration-200 flex flex-col justify-between space-y-5 group shadow-sm hover:shadow-soft-purple"
            >
              <div>
                {/* Card Header: Avatar & Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-pinkAccent-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-pinkAccent-200 transition-colors">
                        {contact.name}
                      </h3>
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border mt-1 ${getBadgeStyle(contact.relationship)}`}>
                        {contact.relationship || 'Guardian'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(contact)}
                      title="Edit Guardian"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                      aria-label="Edit contact"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingContact(contact)}
                      title="Delete Guardian"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                      aria-label="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Phone Display */}
                <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-brand-400" />
                    <span className="font-mono">{contact.phone}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">SOS Enabled</span>
                </div>
              </div>

              {/* Quick Communication Shortcuts */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>
                <a
                  href={`sms:${contact.phone}?body=SafeRoute%20Test%20Alert`}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-pinkAccent-400" />
                  <span>SMS</span>
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        contact={editingContact}
      />

      {/* Delete Confirmation Modal */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-navy-900 border border-navy-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Remove Guardian?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to remove <strong className="text-white">{deletingContact.name}</strong> ({deletingContact.phone}) from your emergency circle? They will no longer receive your SOS broadcasts.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingContact(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Yes, Remove</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContactsPage;

