// src/models/Quiz.js
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
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
