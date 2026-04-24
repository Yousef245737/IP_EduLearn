// src/controllers/quizzesController.js
const { validationResult } = require('express-validator');
const Quiz        = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// ── GET /quizzes ──────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.course = req.query.courseId;

    // Don't return correctAnswer in the list view
    const quizzes = await Quiz.find(filter).select('-questions.correctAnswer').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /quizzes/:id ──────────────────────────────────────────────────────────
// Returns quiz WITH questions but WITHOUT correct answers (so client can't cheat)

exports.getById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid quiz ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /quizzes/:id/attempts ────────────────────────────────────────────────
// Submit answers; server grades and stores the attempt

exports.submitAttempt = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // 1. Fetch quiz with correct answers (no select restriction here)
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { answers, timeTaken } = req.body;
    // answers = [{ questionId: 1, answer: 'some answer' }, ...]

    // 2. Grade each question server-side
    const gradedAnswers = quiz.questions.map((question) => {
      const submitted = answers.find((a) => a.questionId === question.questionId);
      const userAnswer = submitted ? submitted.answer : '';
      const isCorrect  =
        userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      return {
        questionId:    question.questionId,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
      };
    });

    const score      = gradedAnswers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((score / quiz.questions.length) * 100);

    // 3. Persist the attempt
    const attempt = await QuizAttempt.create({
      user:           req.user.userId,
      quiz:           quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      timeTaken,
      answers:        gradedAnswers,
    });

    res.status(201).json(attempt);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid quiz ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /quizzes/:id/attempts/me ──────────────────────────────────────────────
// Get the most recent attempt by the logged-in user for a specific quiz

exports.getMyAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      user: req.user.userId,
      quiz: req.params.id,
    }).sort({ createdAt: -1 });

    if (!attempt) return res.status(404).json({ message: 'No attempt found' });
    res.json(attempt);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid quiz ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
