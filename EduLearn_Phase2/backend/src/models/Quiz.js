// src/models/Quiz.js  (UPDATED — adds isGlobal flag)
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId:    { type: Number, required: true },
  type:          { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], required: true },
  question:      { type: String, required: true },
  options:       { type: [String], default: [] },
  correctAnswer: { type: String, required: true },
}, { _id: false });

const quizSchema = new mongoose.Schema(
  {
    title:       { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, default: '' },
    timeLimit:   { type: Number, default: 0 }, // seconds; 0 = no limit
    dueDate:     { type: Date,   default: null },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Course',
      default: null,
    },
    // isGlobal = true → shown to ALL students regardless of enrollment
    // isGlobal = false (default) → only shown to students enrolled in `course`
    isGlobal: { type: Boolean, default: false },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
