// src/routes/users.js
const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const protect  = require('../middleware/auth');
const { updateProfileRules, changePasswordRules } = require('../middleware/validators');
const {
  getMe,
  updateMe,
  changePassword,
  updatePreferences,
  getMyEnrollments,
} = require('../controllers/usersController');

// ── Multer setup for avatar uploads ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only image files are allowed'));
  },
});

// All routes in this file are protected (Lab 9 Option A pattern)
router.use(protect);

router.get('/',                 getMe);
router.patch('/',               updateProfileRules, upload.single('avatar'), updateMe);
router.patch('/password',       changePasswordRules, changePassword);
router.patch('/preferences',    updatePreferences);
router.get('/enrollments',      getMyEnrollments);

module.exports = router;
