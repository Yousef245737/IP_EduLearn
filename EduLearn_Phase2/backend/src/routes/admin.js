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

module.exports = router;
