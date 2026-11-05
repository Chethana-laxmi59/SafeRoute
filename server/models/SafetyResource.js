import mongoose from 'mongoose';

/**
 * SafetyResource Mongoose Model
 * Stores verified emergency shelters, 24/7 police kiosks, hospital emergency wings,
 * and safe havens for display on the interactive Safety Map.
 * Explicitly tracks demo source and academic verification indicators.
 */
const safetyResourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
      maxlength: [100, 'Resource name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: {
        values: ['police', 'hospital', 'safe_haven'],
        message: 'Category must be police, hospital, or safe_haven',
      },
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    address: {
      type: String,
      trim: true,
      default: 'Address available on request',
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: 'Emergency: 112',
    },
    operatingHours: {
      type: String,
      trim: true,
      default: '24/7 Available',
    },
    source: {
      type: String,
      trim: true,
      default: 'Academic Demonstration Dataset',
    },
    verifiedStatus: {
      type: String,
      trim: true,
      default: 'Simulated Demo Resource',
    },
    description: {
      type: String,
      trim: true,
      default: 'Designated assistance point for emergency support and shelter.',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for coordinate filtering and category search
safetyResourceSchema.index({ category: 1, latitude: 1, longitude: 1 });

const SafetyResource = mongoose.model('SafetyResource', safetyResourceSchema);

export default SafetyResource;

