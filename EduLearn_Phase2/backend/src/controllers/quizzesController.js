// src/controllers/quizzesController.js  (UPDATED — filters by enrollment)
const { validationResult } = require('express-validator');
const Quiz        = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment  = require('../models/Enrollment');

// ── GET /quizzes ──────────────────────────────────────────────────────────────
// Returns:
//   - Global quizzes (isGlobal: true) — always visible to all
//   - Course quizzes — only for courses the student is enrolled in

exports.getAll = async (req, res) => {
  try {
    // Get enrolled course IDs for this user
    const enrollments = await Enrollment.find({ user: req.user.userId }).select('course');
    const enrolledCourseIds = enrollments.map(e => e.course);

    const quizzes = await Quiz.find({
      $or: [
        { isGlobal: true },                              // global quizzes — always show
        { course: { $in: enrolledCourseIds } },          // enrolled course quizzes
        { course: null, isGlobal: { $ne: false } },      // legacy: no course + not explicitly non-global
      ],
    })
      .select('-questions.correctAnswer')
      .populate('course', 'title code')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /quizzes/:id ──────────────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.correctAnswer')
      .populate('course', 'title code');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid quiz ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /quizzes/:id/attempts ────────────────────────────────────────────────
exports.submitAttempt = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const { answers, timeTaken } = req.body;

    const gradedAnswers = quiz.questions.map((question) => {
      const submitted  = answers.find((a) => a.questionId === question.questionId);
      const userAnswer = submitted ? submitted.answer : '';
      const isCorrect  = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      return { questionId: question.questionId, userAnswer, correctAnswer: question.correctAnswer, isCorrect };
    });

    const score      = gradedAnswers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((score / quiz.questions.length) * 100);

    const attempt = await QuizAttempt.create({
      user: req.user.userId,
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      timeTaken,
      answers: gradedAnswers,
    });

    res.status(201).json(attempt);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid quiz ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /quizzes/:id/attempts/me ──────────────────────────────────────────────
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
