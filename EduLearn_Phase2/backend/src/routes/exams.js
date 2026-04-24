// src/routes/exams.js
const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { createExamRules } = require('../middleware/validators');
const { getAll, create, update, remove } = require('../controllers/examsController');

// All exam routes require authentication
router.use(protect);

router.get('/',    getAll);
router.post('/',   createExamRules, create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
