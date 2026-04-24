// src/routes/courses.js
const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const {
  getAll, getById, completeLesson, enroll, unenroll,
} = require('../controllers/coursesController');

// Browse courses — public
router.get('/',    getAll);
router.get('/:id', getById);

// These require authentication
router.post('/:id/enroll',                      protect, enroll);
router.delete('/:id/enroll',                    protect, unenroll);
router.patch('/:id/lessons/:lessonId/complete', protect, completeLesson);

module.exports = router;
