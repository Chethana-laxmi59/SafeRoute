import mongoose from 'mongoose';
import TrustedContact from '../models/TrustedContact.js';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

/**
 * @desc    Create a new trusted contact
 * @route   POST /api/contacts
 * @access  Private (Protected by JWT)
 */
export const createContact = async (req, res, next) => {
  try {
    const { name, phone, relationship } = req.body;

    // 1. Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both contact name and phone number',
      });
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Contact name must be at least 2 characters long',
      });
    }

    if (!PHONE_REGEX.test(trimmedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (e.g. +91 98765 43210 or 10 digits)',
      });
    }

    // 2. Create contact associated with authenticated user
    const contact = await TrustedContact.create({
      user: req.user._id,
      name: trimmedName,
      phone: trimmedPhone,
      relationship: relationship ? relationship.trim() : 'Guardian',
    });

    res.status(201).json({
      success: true,
      message: 'Trusted contact added successfully',
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all trusted contacts for current authenticated user
 * @route   GET /api/contacts
 * @access  Private (Protected by JWT)
 */
export const getContacts = async (req, res, next) => {
  try {
    // Strictly fetch only contacts where user matches req.user._id
    const contacts = await TrustedContact.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single trusted contact by ID
 * @route   GET /api/contacts/:id
 * @access  Private (Protected by JWT)
 */
export const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found (invalid identifier)',
      });
    }

    const contact = await TrustedContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Authorization: User must own this contact
    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access this contact',
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing trusted contact
 * @route   PUT /api/contacts/:id
 * @access  Private (Protected by JWT)
 */
export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, relationship } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found (invalid identifier)',
      });
    }

    const contact = await TrustedContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Authorization: Verify user ownership
    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this contact',
      });
    }

    // Validate updates if provided
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Contact name must be at least 2 characters long',
        });
      }
      contact.name = trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone = phone.trim();
      if (!PHONE_REGEX.test(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number',
        });
      }
      contact.phone = trimmedPhone;
    }

    if (relationship !== undefined) {
      contact.relationship = relationship.trim() || 'Guardian';
    }

    const updatedContact = await contact.save();

    res.status(200).json({
      success: true,
      message: 'Trusted contact updated successfully',
      contact: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a trusted contact
 * @route   DELETE /api/contacts/:id
 * @access  Private (Protected by JWT)
 */
export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found (invalid identifier)',
      });
    }

    const contact = await TrustedContact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Authorization: Verify user ownership
    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this contact',
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trusted contact removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

