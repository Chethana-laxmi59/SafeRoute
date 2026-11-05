import mongoose from 'mongoose';
import EmergencyEvent from '../models/EmergencyEvent.js';
import TrustedContact from '../models/TrustedContact.js';

/**
 * @desc    Trigger an Emergency SOS alert
 * @route   POST /api/sos
 * @access  Private (Protected by JWT)
 */
export const triggerSOS = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy, message } = req.body;

    // 1. Validate coordinates if provided
    let parsedLat = null;
    let parsedLng = null;
    let parsedAcc = null;

    if (latitude !== undefined && latitude !== null) {
      parsedLat = Number(latitude);
      if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude. Must be a valid number between -90 and 90 degrees.',
        });
      }
    }

    if (longitude !== undefined && longitude !== null) {
      parsedLng = Number(longitude);
      if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid longitude. Must be a valid number between -180 and 180 degrees.',
        });
      }
    }

    if (accuracy !== undefined && accuracy !== null) {
      parsedAcc = Number(accuracy);
      if (isNaN(parsedAcc) || parsedAcc < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid accuracy. Must be a positive number in meters.',
        });
      }
    }

    // 2. Fetch user's registered trusted contacts
    const contacts = await TrustedContact.find({ user: req.user._id });

    // 3. Build transparent deliveryDetails array (DEMO MODE STRICT RULES)
    const deliveryDetails = contacts.map((contact) => ({
      contactId: contact._id,
      name: contact.name,
      phone: contact.phone,
      channel: 'demo_simulation',
      delivered: false, // Strict ethical safety rule: never claim external delivery unless actually sent
      status: 'simulated_log',
      note: 'Demo mode active. External SMS dispatch is not configured.',
      timestamp: new Date(),
    }));

    // If no contacts are registered, add an explicit notification note
    if (contacts.length === 0) {
      deliveryDetails.push({
        contactId: null,
        name: 'System Alert',
        phone: 'N/A',
        channel: 'in_app',
        delivered: false,
        status: 'no_contacts_configured',
        note: 'No trusted contacts found in user circle. SOS logged locally.',
        timestamp: new Date(),
      });
    }

    // 4. Create EmergencyEvent in DB
    const event = await EmergencyEvent.create({
      user: req.user._id,
      latitude: parsedLat,
      longitude: parsedLng,
      accuracy: parsedAcc,
      status: 'active',
      alertMode: 'demo', // Always defaults to demo
      deliveryStatus: 'demo_logged',
      deliveryDetails,
      message: message ? String(message).trim().slice(0, 300) : 'Emergency SOS activated by user',
    });

    res.status(201).json({
      success: true,
      message: 'Demo Emergency SOS alert recorded. No external services or contacts were dispatched.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get emergency SOS incident history for authenticated user
 * @route   GET /api/sos/history
 * @access  Private (Protected by JWT)
 */
export const getSOSHistory = async (req, res, next) => {
  try {
    const events = await EmergencyEvent.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently active emergency SOS event (if any)
 * @route   GET /api/sos/active
 * @access  Private (Protected by JWT)
 */
export const getActiveSOSEvent = async (req, res, next) => {
  try {
    const activeEvent = await EmergencyEvent.findOne({
      user: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      event: activeEvent || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single emergency SOS event by ID
 * @route   GET /api/sos/:id
 * @access  Private (Protected by JWT)
 */
export const getSOSEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Emergency event not found (invalid identifier)',
      });
    }

    const event = await EmergencyEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Emergency event not found',
      });
    }

    // Authorization: User must own this event
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this emergency event',
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve an emergency SOS event
 * @route   PATCH /api/sos/:id/resolve
 * @access  Private (Protected by JWT)
 */
export const resolveSOSEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Emergency event not found (invalid identifier)',
      });
    }

    const event = await EmergencyEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Emergency event not found',
      });
    }

    // Authorization: Verify user ownership
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this emergency event',
      });
    }

    event.status = 'resolved';
    event.resolvedAt = new Date();
    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: 'Emergency event marked as resolved',
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an emergency SOS event
 * @route   PATCH /api/sos/:id/cancel
 * @access  Private (Protected by JWT)
 */
export const cancelSOSEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Emergency event not found (invalid identifier)',
      });
    }

    const event = await EmergencyEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Emergency event not found',
      });
    }

    // Authorization: Verify user ownership
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this emergency event',
      });
    }

    event.status = 'cancelled';
    event.cancelledAt = new Date();
    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: 'Emergency event cancelled by user',
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

