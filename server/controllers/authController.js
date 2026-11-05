import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Helper email validator regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Validate name length
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
    }

    // 3. Validate email format
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // 4. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // 5. Prevent duplicate email registration
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // 6. Create new user (pre-save hook hashes the password)
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : '',
    });

    // 7. Generate JWT token
    const token = generateToken(user._id);

    // 8. Respond with token and safe user payload
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Lookup user and explicitly select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // 3. Verify user and password match
    // Using generic error to prevent email enumeration
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Generate JWT
    const token = generateToken(user._id);

    // 5. Return token and safe user details
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by JWT)
 */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Update user profile (name, phone)
 * @route   PATCH /api/auth/profile
 * @access  Private (Protected by JWT)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long',
        });
      }
      if (trimmedName.length > 60) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot exceed 60 characters',
        });
      }
      user.name = trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone = phone.trim();
      if (trimmedPhone && !/^\+?[0-9\s\-()]{7,20}$/.test(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number (e.g. +91 98765 43210 or 10 digits)',
        });
      }
      user.phone = trimmedPhone;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

