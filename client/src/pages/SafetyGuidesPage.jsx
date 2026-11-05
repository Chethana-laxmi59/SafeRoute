import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  ShieldCheck, 
  Smartphone, 
  Scale, 
  AlertTriangle, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  X, 
  Compass, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

const GUIDES_DATABASE = [
  // 1. PERSONAL & COMMUTE SAFETY
  {
    id: 'commute-rideshare-safety',
    title: 'Rideshare & Late-Night Cab Verification',
    category: 'commute',
    categoryLabel: 'Personal & Commute',
    readTime: '3 min read',
    summary: 'Essential verification steps before and during late-night rideshare or auto travel.',
    helpline: '112 / 1091',
    actionItems: [
      'Match the vehicle number plate and driver photo before opening the car door.',
      'Ask the driver "Who are you picking up?" instead of asking "Are you for [My Name]?".',
      'Share your live trip status with a trusted contact via SafeRoute or WhatsApp.',
      'Sit in the rear seat on the passenger side to maximize exits and visibility.',
    ],
    content: `
When traveling alone at night or in unfamiliar zones, active verification keeps you in control:

1. **Before Getting In**: Never enter a cab or rideshare without verifying the license plate, vehicle model, and driver portrait displayed in the application.

2. **The Name Check Rule**: Avoid asking "Are you driving for Priya?". Instead, ask "Who is your scheduled passenger?". Legitimate rideshare drivers will clearly state your name from their driver interface.

3. **Seating Strategy**: Sit on the rear passenger side (diagonally opposite the driver). This ensures you have dual exit access, unobstructed view of the driver's hands, and cannot be easily cornered.

4. **Live Geolocation Check-In**: Share your live location with a guardian through SafeRoute before moving. If the driver takes an unexpected detour, do not hesitate to call a friend or emergency services on speakerphone.
    `,
  },
  {
    id: 'commute-public-transit',
    title: 'Public Transit & Platform Awareness',
    category: 'commute',
    categoryLabel: 'Personal & Commute',
    readTime: '4 min read',
    summary: 'Practical strategies for metro platforms, suburban trains, and evening bus waiting.',
    helpline: '112 / Metro Security',
    actionItems: [
      'Wait near station control rooms, CCTV cameras, or designated women coaches.',
      'Avoid standing on unlit corners or near isolated platform exits.',
      'Keep one ear free from headphones to maintain situational acoustics.',
      'If followed, head towards active ticket kiosks or commercial stores.',
    ],
    content: `
Navigating crowded stations or quiet evening transit corridors requires proactive awareness:

1. **Wait in Lighted Hubs**: Always wait near the station manager's office, active ticketing kiosks, or directly under visible CCTV cameras.

2. **Acoustic Awareness**: Avoid wearing noise-cancelling headphones in both ears when walking through stations or bus stops at night. Keeping your senses alert gives you crucial seconds to react.

3. **Dedicated Women Coaches**: Whenever available, board designated women-only coaches or sit near the bus conductor and driver rather than the back row.

4. **De-Escalation & Seeking Help**: If someone makes you uncomfortable, move immediately towards staff or other passengers. You do not need to confront the person directly; moving into populated areas is the safest course of action.
    `,
  },

  // 2. DIGITAL & CYBER SAFETY
  {
    id: 'cyber-location-privacy',
    title: 'Smartphone Location Privacy & Cyber Hygiene',
    category: 'cyber',
    categoryLabel: 'Digital & Cyber Safety',
    readTime: '4 min read',
    summary: 'Protecting your digital footprint, preventing unauthorized tracking, and app permissions.',
    helpline: 'National Cyber Crime: 1930',
    actionItems: [
      'Audit smartphone app permissions: set location access to "While Using" only.',
      'Disable Bluetooth and AirDrop / Quick Share in crowded public venues.',
      'Avoid real-time location check-ins on public social media accounts.',
      'Use multi-factor authentication (MFA) on personal email and messaging apps.',
    ],
    content: `
Digital security directly impacts personal physical safety:

1. **App Permission Auditing**: Routinely review settings on your iOS or Android phone. Restrict location permissions to "Only while using the app", and revoke location from social platforms, flashlights, or games.

2. **Delayed Social Posting**: Never post real-time check-ins or stories revealing your exact current cafe, gym, or residence until you have physically left that location.

3. **Bluetooth & AirDrop Exposure**: Keep Bluetooth discoverability and AirDrop/QuickShare set to "Contacts Only" or turned off when in trains or malls to block unprompted file drops and unwanted pairing attempts.

4. **Reporting Cyber Harassment**: If faced with digital harassment, take screenshots with date stamps and report directly to the National Cyber Crime Portal (cybercrime.gov.in) or call helpline 1930.
    `,
  },
  {
    id: 'cyber-device-emergency-shortcuts',
    title: 'Configuring Hardware SOS Buttons on Smartphones',
    category: 'cyber',
    categoryLabel: 'Digital & Cyber Safety',
    readTime: '3 min read',
    summary: 'How to trigger emergency hardware shortcuts on Android and iPhone instantly.',
    helpline: '112 Direct Trigger',
    actionItems: [
      'Enable "Emergency SOS" in iPhone settings (press side button 5 times or hold volume).',
      'Enable "Emergency SOS" in Android settings (rapidly press power button 5 times).',
      'Pre-fill Medical ID and emergency contacts in system settings.',
    ],
    content: `
Both modern operating systems offer physical hardware shortcuts to call emergency services without unlocking your screen:

1. **Apple iPhone**: Go to Settings > Emergency SOS. Enable "Call with 5 Presses" and "Call with Hold". When activated, it emits a countdown alert, dials 112, and sends your coordinates to your system emergency contacts.

2. **Android Devices**: Go to Settings > Safety & Emergency > Emergency SOS. Turn on the toggle to rapidly press the power button 5 times. Configure it to dial 112 and record distress video/audio automatically.

3. **Medical ID**: Configure your blood group, allergies, and emergency phone numbers in your device's lock-screen emergency info so first responders can assist without a passcode.
    `,
  },

  // 3. EMERGENCY PREPAREDNESS
  {
    id: 'emergency-circle-setup',
    title: 'Setting Up an Effective Emergency Guardian Circle',
    category: 'emergency',
    categoryLabel: 'Emergency Preparedness',
    readTime: '3 min read',
    summary: 'How to choose, brief, and coordinate with your trusted emergency contacts.',
    helpline: '112 / SafeRoute SOS',
    actionItems: [
      'Include contacts who live locally and contacts who live in different time zones/areas.',
      'Inform your designated guardians so they recognize SafeRoute notifications.',
      'Establish a simple check-in word or phrase for discreet confirmation.',
      'Keep a portable power bank charged in your bag at all times.',
    ],
    content: `
An emergency network is only as effective as the mutual communication protocol you establish:

1. **Diverse Geographical Circle**: Your circle should include at least one roommate or neighbor who can reach you physically within 15 minutes, and one family member who will always answer emergency calls.

2. **Brief Your Guardians**: Make sure your trusted contacts know that you have added them on SafeRoute. Share instructions so they know that a notification from SafeRoute represents a verified distress signal.

3. **Discreet Check-in Keywords**: Agree on an innocent phrase with your roommate (e.g. "Did you leave the blue notebook on the desk?") that subtly indicates you are uncomfortable and need them to call you or pick you up immediately.

4. **Battery Discipline**: Keep a slim 5,000mAh power bank in your daily bag. A dead phone renders digital safety tools useless.
    `,
  },

  // 4. LEGAL RIGHTS & HELP RESOURCES
  {
    id: 'legal-zero-fir',
    title: 'Understanding "Zero FIR" & Police Registration Rights',
    category: 'legal',
    categoryLabel: 'Legal Rights & Resources',
    readTime: '5 min read',
    summary: 'Your statutory right to register an FIR at any police station regardless of jurisdiction.',
    helpline: '112 / 1091 (Women Helpline)',
    actionItems: [
      'A Zero FIR can be registered at ANY police station, irrespective of where the incident occurred.',
      'Police officers CANNOT refuse to register an FIR on jurisdictional grounds.',
      'Women have the right to record statements in the presence of a female officer.',
      'Right to free copy of the registered FIR immediately.',
    ],
    content: `
Under Indian Criminal Law (provisions codified in the CrPC / Bharatiya Nagarik Suraksha Sanhita):

1. **What is a Zero FIR?**: If a cognizable offense occurs, you are legally entitled to lodge an FIR at the nearest police station, even if the incident occurred outside that station's territorial jurisdiction. The station assigns it number "0" and transfers it to the appropriate jurisdiction after recording your complaint.

2. **Protection Against Refusal**: Section 166A of the Indian Penal Code / BNS makes it a punishable offense for a public servant or police officer to knowingly refuse to record information regarding specified offenses against women.

3. **Presence of Female Officers**: Statements regarding sensitive offenses must be recorded by a woman police officer or in the presence of a female social worker or guardian.

4. **Free FIR Copy**: The complainant has the statutory right to receive a free, physical or electronic copy of the First Information Report immediately upon registration.
    `,
  },
  {
    id: 'legal-free-aid-helplines',
    title: 'Free Legal Aid & National Commission for Women',
    category: 'legal',
    categoryLabel: 'Legal Rights & Resources',
    readTime: '4 min read',
    summary: 'Accessing state-funded legal aid and institutional women protection mechanisms.',
    helpline: 'NALSA: 15100 • NCW: 7827170170',
    actionItems: [
      'Article 39A guarantees free legal assistance to all women regardless of income.',
      'NALSA (National Legal Services Authority) provides free panel lawyers.',
      'National Commission for Women operates 24/7 dedicated complaint cell.',
      'Women in Distress Helpline: 181 (Toll-Free).',
    ],
    content: `
Every woman in India has access to institutional legal protection and free government counsel:

1. **Free Legal Representation**: Under Section 12 of the Legal Services Authorities Act, 1987 (and constitutional mandate under Article 39A), all women, irrespective of their financial status or income bracket, are entitled to free legal services from the District Legal Services Authority (DLSA).

2. **National Legal Services Authority (NALSA)**: Dial toll-free helpline **15100** for immediate legal advice, duty counsel assignment, and dispute assistance.

3. **National Commission for Women (NCW)**: Operates a 24/7 helpline (**7827170170**) specifically for women facing violence, harassment, or administrative delays.

4. **One Stop Centres (Sakhi Centres)**: Government centers providing integrated medical aid, police facilitation, legal counsel, and temporary shelter under one roof.
    `,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Guides' },
  { id: 'commute', label: 'Commute & Travel', icon: Compass },
  { id: 'cyber', label: 'Digital & Cyber', icon: Smartphone },
  { id: 'emergency', label: 'Emergency Prep', icon: AlertTriangle },
  { id: 'legal', label: 'Legal Rights', icon: Scale },
  { id: 'saved', label: 'Saved Bookmarks', icon: BookmarkCheck },
];

const SafetyGuidesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('saferoute_bookmarked_guides');
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read bookmarks from localStorage');
    }
  }, []);

  // Toggle bookmark helper
  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
      } else {
        updated = [...prev, id];
      }
      try {
        localStorage.setItem('saferoute_bookmarked_guides', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save bookmark to storage');
      }
      return updated;
    });
  };

  // Filtered guides based on search, category, and bookmarks
  const filteredGuides = useMemo(() => {
    return GUIDES_DATABASE.filter((guide) => {
      // Category match
      if (selectedCategory === 'saved') {
        if (!bookmarkedIds.includes(guide.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (guide.category !== selectedCategory) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = guide.title.toLowerCase().includes(q);
        const matchesSummary = guide.summary.toLowerCase().includes(q);
        const matchesContent = guide.content.toLowerCase().includes(q);
        return matchesTitle || matchesSummary || matchesContent;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, bookmarkedIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner: Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-brand-700/40 shadow-soft-purple">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/50 text-[11px] font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-pinkAccent-400" />
            <span>Empowerment & Prevention Knowledge Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Safety Guides & Legal Rights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Practical strategies, cyber hygiene guidelines, emergency preparedness checklists, and verified legal frameworks designed for women's daily safety.
          </p>
        </div>
      </div>

      {/* Educational & Non-Confrontational Disclaimer */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div className="text-slate-300">
            <strong className="text-white">Educational Safety Notice:</strong> These guides provide preventative strategies and verified legal information. They are not a substitute for formal legal representation or emergency intervention. Always prioritize seeking safe refuge and calling 112 in immediate danger.
          </div>
        </div>
        <div className="text-slate-400 text-[11px] flex-shrink-0">
          Peer-Reviewed Content
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-600 to-pinkAccent-600 text-white border-transparent shadow-soft-purple scale-[1.02]'
                    : 'bg-navy-900 hover:bg-navy-850 text-slate-300 border-navy-800'
                }`}
              >
                <span>{cat.label}</span>
                {cat.id === 'saved' && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-navy-950 font-mono">
                    {bookmarkedIds.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides by keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-900 border border-navy-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900 border border-navy-800 text-center space-y-3 max-w-lg mx-auto text-xs text-slate-400">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No Guides Found</h3>
          <p>
            {selectedCategory === 'saved'
              ? 'You have not saved any bookmarks yet. Click the bookmark icon on any guide card to save it for quick offline reference.'
              : 'No safety guides matched your search query. Try typing a different keyword.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => {
            const isBookmarked = bookmarkedIds.includes(guide.id);

            return (
              <div
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="p-6 rounded-2xl bg-navy-900 border border-navy-800 hover:border-brand-500/50 hover:bg-navy-850/80 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-soft-purple group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Bookmark button */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-800/60">
                      {guide.categoryLabel}
                    </span>

                    <button
                      onClick={(e) => toggleBookmark(guide.id, e)}
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Guide'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'text-pinkAccent-400 bg-pinkAccent-950/60 border border-pinkAccent-800/60'
                          : 'text-slate-500 hover:text-white hover:bg-navy-800'
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Reading Time */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-pinkAccent-200 transition-colors leading-snug">
                      {guide.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{guide.readTime}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {guide.summary}
                  </p>
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
                  {guide.helpline ? (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {guide.helpline}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Preventative Guide</span>
                  )}

                  <span className="text-xs font-semibold text-brand-400 group-hover:text-brand-300 flex items-center space-x-1">
                    <span>Read Full Guide</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* FULL GUIDE DETAIL MODAL */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedGuide(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pr-8">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-800/60">
                  {selectedGuide.categoryLabel}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{selectedGuide.readTime}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {selectedGuide.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedGuide.summary}
              </p>
            </div>

            {/* Action Checkpoints Box */}
            <div className="p-4 rounded-2xl bg-navy-850 border border-navy-750 space-y-2.5">
              <div className="text-xs font-bold text-pinkAccent-300 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-pinkAccent-400" />
                <span>Actionable Safety Takeaways</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedGuide.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-brand-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Content Body */}
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-navy-800 pt-4 space-y-3 font-normal">
              {selectedGuide.content}
            </div>

            {/* Modal Footer: Helplines & Bookmark */}
            <div className="pt-4 border-t border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                <span>Helpline Reference: <strong className="text-white font-mono">{selectedGuide.helpline}</strong></span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  onClick={(e) => toggleBookmark(selectedGuide.id, e)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center space-x-1.5 ${
                    bookmarkedIds.includes(selectedGuide.id)
                      ? 'bg-pinkAccent-950 text-pinkAccent-300 border-pinkAccent-800'
                      : 'bg-navy-800 text-slate-300 border-navy-700 hover:bg-navy-750'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{bookmarkedIds.includes(selectedGuide.id) ? 'Saved' : 'Bookmark Guide'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SafetyGuidesPage;
