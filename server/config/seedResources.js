import SafetyResource from '../models/SafetyResource.js';

export const DEMO_SAFETY_RESOURCES = [
  // POLICE STATIONS & KIOSKS
  {
    name: 'Central Women Police Desk & Assistance Booth',
    category: 'police',
    latitude: 28.6145,
    longitude: 77.2095,
    address: 'Near Central Plaza, Connaught Area, New Delhi',
    phone: 'Dial 112 / 1091 (Demonstration)',
    operatingHours: '24/7 Immediate Response',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Designated 24/7 women assistance desk with female duty officers on call.',
    isDemo: true,
  },
  {
    name: 'Metro Transit Police Safety Kiosk',
    category: 'police',
    latitude: 28.6210,
    longitude: 77.2150,
    address: 'Gate 2 Metro Concourse, Transit Corridor',
    phone: 'Dial 112 (Demonstration)',
    operatingHours: '24/7 During Transit Hours',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Rapid transit police outpost equipped with CCTV surveillance and security staff.',
    isDemo: true,
  },
  {
    name: 'Cubbon Park Police Security Outpost',
    category: 'police',
    latitude: 12.9760,
    longitude: 77.5910,
    address: 'Kasturba Road Entrance, Cubbon Park, Bengaluru',
    phone: 'Dial 112 / 1091 (Demonstration)',
    operatingHours: '24/7 Active Patrol',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Public park patrol post providing direct safety assistance to evening joggers and commuters.',
    isDemo: true,
  },
  {
    name: 'Vidhana Soudha Transit Police Booth',
    category: 'police',
    latitude: 12.9720,
    longitude: 77.5950,
    address: 'Dr. Ambedkar Veedhi, Bengaluru',
    phone: 'Dial 112 (Demonstration)',
    operatingHours: '24/7 Monitored',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Official transit safety post providing rapid escort assistance in high-density corridors.',
    isDemo: true,
  },

  // HOSPITALS & 24/7 EMERGENCY CARE
  {
    name: 'City General Hospital Emergency Trauma Wing',
    category: 'hospital',
    latitude: 28.6180,
    longitude: 77.2180,
    address: 'Main Health Boulevard, Sector 4, New Delhi',
    phone: '102 / 112 (Demonstration Emergency)',
    operatingHours: '24/7 Emergency & Ambulance',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Public hospital with specialized trauma response, triage unit, and female care staff.',
    isDemo: true,
  },
  {
    name: 'Apex 24/7 Urgent Care & Medical Hub',
    category: 'hospital',
    latitude: 28.6090,
    longitude: 77.2030,
    address: 'Outer Ring Junction, South Extension, New Delhi',
    phone: 'Emergency Line: 112 (Demonstration)',
    operatingHours: '24/7 Walk-in Available',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Walk-in emergency care facility equipped for rapid medical stabilization.',
    isDemo: true,
  },
  {
    name: 'Victoria Memorial 24/7 Emergency Center',
    category: 'hospital',
    latitude: 12.9680,
    longitude: 77.5890,
    address: 'Fort Road, Near City Market, Bengaluru',
    phone: '102 / 112 (Demonstration Emergency)',
    operatingHours: '24/7 Emergency Admissions',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Major regional medical center with dedicated 24/7 crisis and medical assistance.',
    isDemo: true,
  },
  {
    name: 'St. Martha Healthcare Emergency Wing',
    category: 'hospital',
    latitude: 12.9735,
    longitude: 77.5880,
    address: 'Nrupathunga Road, Bengaluru',
    phone: 'Dial 112 (Demonstration)',
    operatingHours: '24/7 Triage & Medical',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Centrally located acute care facility providing immediate sanctuary and emergency treatment.',
    isDemo: true,
  },

  // SAFE HAVENS & COMMUNITY ASSISTANCE SHELTERS
  {
    name: '24/7 Transit Safe Haven & Commuter Shelter',
    category: 'safe_haven',
    latitude: 28.6120,
    longitude: 77.2110,
    address: 'Railway & Bus Interchange Hub, New Delhi',
    phone: 'Dial 181 (Women in Distress Hotline)',
    operatingHours: '24/7 Open & Staffed',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Well-lit, security-guarded safe shelter with phone charging, water, and emergency phone link.',
    isDemo: true,
  },
  {
    name: 'Central Women Support & Crisis Guidance Kiosk',
    category: 'safe_haven',
    latitude: 28.6250,
    longitude: 77.2050,
    address: 'Community Center Complex, Janpath Lane, New Delhi',
    phone: 'Dial 1091 (Women Safety)',
    operatingHours: '24/7 Volunteer Supported',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Community-run sanctuary offering immediate protection, legal counseling guidance, and rest area.',
    isDemo: true,
  },
  {
    name: 'MG Road Community Assistance & Safe Point',
    category: 'safe_haven',
    latitude: 12.9750,
    longitude: 77.6080,
    address: 'Opposite Metro Station, MG Road, Bengaluru',
    phone: 'Dial 181 (Helpline Demonstration)',
    operatingHours: '24/7 Open Sanctuary',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Safe haven located in high-footfall zone with active security personnel and panic alert connection.',
    isDemo: true,
  },
  {
    name: 'University Campus Security & Help Point',
    category: 'safe_haven',
    latitude: 12.9790,
    longitude: 77.5970,
    address: 'Central Campus Gate, Palace Road, Bengaluru',
    phone: 'Campus Security: Dial 112',
    operatingHours: '24/7 Guarded Gatehouse',
    source: 'Academic Demonstration Dataset',
    verifiedStatus: 'Simulated Demo Resource',
    description: 'Campus checkpoint providing safe waiting spaces, intercom support, and night escort for students.',
    isDemo: true,
  },
];

/**
 * Automatically seeds demo safety resources into MongoDB if collection is empty
 */
export const seedDefaultResources = async () => {
  try {
    const count = await SafetyResource.countDocuments();
    if (count === 0) {
      console.log('[Seed] Initializing demonstration safety resources...');
      await SafetyResource.insertMany(DEMO_SAFETY_RESOURCES);
      console.log(`[Seed] Seeded ${DEMO_SAFETY_RESOURCES.length} demo safety resources.`);
    }
  } catch (err) {
    console.warn('[Seed Error] Could not initialize demo resources:', err.message);
  }
};

export default seedDefaultResources;

