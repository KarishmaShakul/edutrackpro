const { User } = require('../models');
const { generateTokens, generateAccessToken, verifyToken } = require('../utils/token');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @desc    Login user
 * @route   POST /api/user/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find user with password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated. Please contact admin.', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update last login and refresh token
    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    await user.save();

    return successResponse(res, 'Login successful', {
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedClasses: user.assignedClasses
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error during login', 500);
  }
};

/**
 * @desc    Logout user
 * @route   GET /api/user/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    // Clear refresh token
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }

    return successResponse(res, 'Logout successful');

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Server error during logout', 500);
  }
};

/**
 * @desc    Validate token
 * @route   ALL /api/user/validate
 * @access  Private
 */
const validateToken = async (req, res) => {
  try {
    const user = req.user;

    return successResponse(res, 'Token is valid', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedClasses: user.assignedClasses
      }
    });

  } catch (error) {
    console.error('Validate error:', error);
    return errorResponse(res, 'Invalid token', 401);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/user/refresh
 * @access  Public (with refresh token)
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    return successResponse(res, 'Token refreshed', { token: accessToken });

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 'Invalid refresh token', 401);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedClasses', 'classname description');

    return successResponse(res, 'Profile retrieved', { user });

  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('assignedClasses', 'classname description');

    return successResponse(res, 'Profile updated', { user });

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/user/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current and new passwords are required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters', 400);
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return successResponse(res, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

module.exports = {
  login,
  logout,
  validateToken,
  refreshAccessToken,
  getProfile,
  updateProfile,
  changePassword
};
