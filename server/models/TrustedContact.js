import mongoose from 'mongoose';

/**
 * TrustedContact Mongoose Model
 * Stores guardian / emergency contacts designated by each user.
 * Each contact belongs to a specific User ObjectId.
 */
const trustedContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contact must belong to an authenticated user'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide the contact full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
      match: [
        /^\+?[0-9\s\-()]{7,20}$/,
        'Please provide a valid phone number (e.g. +91 98765 43210 or 10-15 digits)',
      ],
    },
    relationship: {
      type: String,
      trim: true,
      default: 'Guardian',
      maxlength: [30, 'Relationship cannot exceed 30 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help efficiently retrieve a user's contacts sorted by creation
trustedContactSchema.index({ user: 1, createdAt: -1 });

const TrustedContact = mongoose.model('TrustedContact', trustedContactSchema);

export default TrustedContact;

