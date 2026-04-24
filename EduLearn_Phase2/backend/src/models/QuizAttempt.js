// src/models/QuizAttempt.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId:    { type: Number, required: true },
  userAnswer:    { type: String, default: '' },
  correctAnswer: { type: String, required: true },
  isCorrect:     { type: Boolean, required: true },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    score:          { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage:     { type: Number, required: true },
    timeTaken:      { type: Number, required: true }, // seconds
    answers:        [answerSchema],
  },
  { timestamps: true }
);

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;
