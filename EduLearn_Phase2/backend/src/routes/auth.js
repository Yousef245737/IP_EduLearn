// src/routes/auth.js
const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validators');
const { register, login, getMe }    = require('../controllers/authController');

// Validators run BEFORE the controller (Lab 9 pattern)
router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.get('/me',        protect,       getMe);   // GET /auth/me — protected

module.exports = router;
