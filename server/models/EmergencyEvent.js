import mongoose from 'mongoose';

/**
 * EmergencyEvent Mongoose Model
 * Represents an individual Emergency SOS incident triggered by a user.
 * Stores timestamp, GPS coordinates, accuracy, status, and delivery audit log.
 */
const emergencyEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Emergency event must belong to an authenticated user'],
      index: true,
    },
    latitude: {
      type: Number,
      required: false,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: false,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    accuracy: {
      type: Number,
      default: null, // GPS accuracy in meters
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'resolved', 'cancelled'],
        message: 'Status must be active, resolved, or cancelled',
      },
      default: 'active',
      index: true,
    },
    alertMode: {
      type: String,
      enum: {
        values: ['demo', 'real'],
        message: 'Alert mode must be demo or real',
      },
      default: 'demo',
    },
    deliveryStatus: {
      type: String,
      default: 'demo_logged',
    },
    deliveryDetails: [
      {
        contactId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'TrustedContact',
        },
        name: String,
        phone: String,
        channel: {
          type: String,
          default: 'demo_simulation',
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        status: {
          type: String,
          default: 'simulated_log',
        },
        note: {
          type: String,
          default: 'Demo mode active. External SMS dispatch not configured.',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    message: {
      type: String,
      trim: true,
      default: 'Emergency SOS activated by user',
      maxlength: [300, 'Distress message cannot exceed 300 characters'],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user emergency history ordered by creation time
emergencyEventSchema.index({ user: 1, createdAt: -1 });

const EmergencyEvent = mongoose.model('EmergencyEvent', emergencyEventSchema);

export default EmergencyEvent;

