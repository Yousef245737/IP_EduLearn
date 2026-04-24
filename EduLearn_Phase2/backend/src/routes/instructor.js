// src/routes/instructor.js
const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const {
  getMyCourses, getCourseById, updateCourse, getCourseStudents,
  getCourseQuizzes, createQuiz,
  getQuizById, updateQuiz, deleteQuiz, getQuizResults,
} = require('../controllers/instructorController');

// ── Instructor-only guard ─────────────────────────────────────────────────────
function instructorOnly(req, res, next) {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Instructor access required' });
  }
  next();
}

router.use(protect);
router.use(instructorOnly);

// ── Quiz routes MUST come before /:id routes ──────────────────────────────────
// Otherwise Express matches "quizzes" as the :id parameter
router.get('/quizzes/:quizId/results', getQuizResults);
router.get('/quizzes/:quizId',         getQuizById);
router.patch('/quizzes/:quizId',       updateQuiz);
router.delete('/quizzes/:quizId',      deleteQuiz);

// ── Course routes ─────────────────────────────────────────────────────────────
router.get('/',                  getMyCourses);
router.get('/:id/students',      getCourseStudents);
router.get('/:id/quizzes',       getCourseQuizzes);
router.post('/:id/quizzes',      createQuiz);
router.get('/:id',               getCourseById);
router.patch('/:id',             updateCourse);

module.exports = router;
