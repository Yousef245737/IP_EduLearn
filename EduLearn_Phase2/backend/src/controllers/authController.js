// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ── Helpers ───────────────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// Strip password from the object we send back
function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

// ── POST /auth/register ───────────────────────────────────────────────────────

exports.register = async (req, res) => {
  // 1. Check validation errors from express-validator (Lab 9 pattern)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // 2. Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 3. Hash password (10 rounds as per Lab 9)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({ name, email, password: hashedPassword });

    // 5. Return token + user (never return the password)
    const token = signToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /auth/login ──────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // 1. Find user (same error for both wrong email and wrong password
    //    to prevent user-enumeration attacks — Lab 9 principle)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Sign and return JWT
    const token = signToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /auth/me ──────────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    // req.user.userId is set by the protect middleware
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
