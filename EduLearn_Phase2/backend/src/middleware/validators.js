// src/middleware/validators.js
const { body } = require('express-validator');

// ── Auth ──────────────────────────────────────────────────────────────────────

exports.registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain at least one number'),
];

exports.loginRules = [
  body('email')
    .trim()
    .isEmail().withMessage('Must be a valid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── User / Profile ────────────────────────────────────────────────────────────

exports.updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address'),
  body('phone')
    .optional()
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 }).withMessage('Bio must be 500 characters or fewer'),
];

exports.changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain at least one number'),
];

// ── Exams ─────────────────────────────────────────────────────────────────────

exports.createExamRules = [
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required'),
  body('type')
    .isIn(['midterm', 'final', 'quiz', 'practical']).withMessage('Invalid exam type'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO date'),
  body('time')
    .notEmpty().withMessage('Time is required'),
];

// ── Quiz Attempts ─────────────────────────────────────────────────────────────

exports.submitAttemptRules = [
  body('answers')
    .isArray({ min: 1 }).withMessage('Answers must be a non-empty array'),
  body('timeTaken')
    .isInt({ min: 0 }).withMessage('timeTaken must be a non-negative integer'),
];
