// src/controllers/usersController.js
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User       = require('../models/User');
const Enrollment = require('../models/Enrollment');

// ── GET /users/me ─────────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /users/me ───────────────────────────────────────────────────────────

exports.updateMe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Only allow these fields to be updated
    const allowed = ['name', 'email', 'phone', 'dateOfBirth', 'bio', 'skills'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle profile picture upload path (set by multer middleware)
    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /users/me/password ──────────────────────────────────────────────────

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Fetch user with password
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // 3. Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /users/me/preferences ───────────────────────────────────────────────

exports.updatePreferences = async (req, res) => {
  try {
    const allowed = [
      'language', 'timezone', 'dateFormat',
      'examReminders', 'gradeUpdates', 'courseAnnounce',
      'systemUpdates', 'emailDigest', 'pushNotifications',
    ];
    const prefUpdates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        prefUpdates[`preferences.${key}`] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      prefUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /users/me/enrollments ─────────────────────────────────────────────────
// Returns the logged-in student's enrolled courses with full course details

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.userId })
      .populate('course', '-weeks') // exclude weeks for the list view
      .sort({ enrolledAt: -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
