// src/models/Exam.js  (UPDATED — adds isGlobal, courseId, createdBy)
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    // For personal exams this is the student; for global it's the admin who created it
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject:  { type: String, required: [true, 'Subject is required'], trim: true },
    type:     { type: String, enum: ['midterm', 'final', 'quiz', 'practical'], required: true },
    date:     { type: Date,   required: [true, 'Date is required'] },
    time:     { type: String, required: [true, 'Time is required'] },
    location: { type: String, default: '' },
    duration: { type: String, default: '' },
    notes:    { type: String, default: '' },
    reminders: {
      oneDayBefore:  { type: Boolean, default: false },
      oneHourBefore: { type: Boolean, default: false },
    },

    // ── Global exam fields ─────────────────────────────────────────────────────
    // isGlobal = true → created by admin, visible to all students enrolled in courseId
    isGlobal:  { type: Boolean, default: false },
    courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   default: null },
  },
  { timestamps: true }
);

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
