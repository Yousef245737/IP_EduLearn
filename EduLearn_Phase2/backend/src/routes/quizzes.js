// src/routes/quizzes.js
const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { submitAttemptRules } = require('../middleware/validators');
const { getAll, getById, submitAttempt, getMyAttempt } = require('../controllers/quizzesController');

// Quiz list and detail are public (students can view before starting)
router.get('/',    getAll);
router.get('/:id', getById);

// Submitting and fetching personal attempts require auth
router.post('/:id/attempts',    protect, submitAttemptRules, submitAttempt);
router.get('/:id/attempts/me',  protect, getMyAttempt);

module.exports = router;
