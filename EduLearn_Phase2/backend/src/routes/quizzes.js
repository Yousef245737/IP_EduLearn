// src/routes/quizzes.js  (UPDATED — getAll now requires auth to filter by enrollment)
const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { submitAttemptRules } = require('../middleware/validators');
const { getAll, getById, submitAttempt, getMyAttempt } = require('../controllers/quizzesController');

// All quiz routes require auth (getAll filters by enrollment, needs req.user)
router.use(protect);

router.get('/',    getAll);
router.get('/:id', getById);
router.post('/:id/attempts',   submitAttemptRules, submitAttempt);
router.get('/:id/attempts/me', getMyAttempt);

module.exports = router;
