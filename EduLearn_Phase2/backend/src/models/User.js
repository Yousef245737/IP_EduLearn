// src/models/User.js  (UPDATED — adds 'instructor' role)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name is too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],  // ← instructor added
      default: 'student',
    },
    phone:        { type: String,   default: '' },
    dateOfBirth:  { type: String,   default: '' },
    bio:          { type: String,   default: '', maxlength: [500, 'Bio must be 500 characters or fewer'] },
    profilePicture: { type: String, default: '' },
    skills:       { type: [String], default: [] },
    preferences: {
      language:          { type: String,  default: 'en' },
      timezone:          { type: String,  default: 'Africa/Cairo' },
      dateFormat:        { type: String,  default: 'DD/MM/YYYY' },
      examReminders:     { type: Boolean, default: true },
      gradeUpdates:      { type: Boolean, default: true },
      courseAnnounce:    { type: Boolean, default: true },
      systemUpdates:     { type: Boolean, default: false },
      emailDigest:       { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
