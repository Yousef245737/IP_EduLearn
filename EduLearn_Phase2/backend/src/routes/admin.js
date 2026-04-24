// src/routes/admin.js
const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/auth');
const {
  getAllUsers, createUser, getUserById, updateUser, deleteUser,
  getAllCourses, createCourse, getCourseById, updateCourse, deleteCourse,
  getStats,
} = require('../controllers/adminController');
const {
  adminCreate, adminGetAll, adminUpdate, adminRemove,
} = require('../controllers/examsController');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}

router.use(protect);
router.use(adminOnly);

// Stats
router.get('/stats', getStats);

// Users
router.get('/users',       getAllUsers);
router.post('/users',      createUser);
router.get('/users/:id',   getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Courses
router.get('/courses',       getAllCourses);
router.post('/courses',      createCourse);
router.get('/courses/:id',   getCourseById);
router.patch('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Global Exams (admin-set, visible to enrolled students)
router.get('/exams',       adminGetAll);
router.post('/exams',      adminCreate);
router.patch('/exams/:id', adminUpdate);
router.delete('/exams/:id', adminRemove);

// Admin Quiz Management (global + course quizzes)
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('course', 'title code').sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title code');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/quizzes', async (req, res) => {
  try {
    const { title, description, timeLimit, isGlobal, course, questions } = req.body;
    if (!title || !questions?.length) return res.status(400).json({ message: 'title and questions are required' });
    const quiz = await Quiz.create({ title, description: description || '', timeLimit: timeLimit || 0, isGlobal: isGlobal ?? true, course: course || null, questions });
    await quiz.populate('course', 'title code');
    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/quizzes/:id', async (req, res) => {
  try {
    const allowed = ['title', 'description', 'timeLimit', 'isGlobal', 'course', 'questions'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('course', 'title code');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizAttempt.deleteMany({ quiz: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
