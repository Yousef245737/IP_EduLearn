// src/routes/messages.js
const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { send, getAll, markRead, remove } = require('../controllers/messagesController');

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}

router.use(protect);

// Student: send a message
router.post('/', send);

// Admin only
router.get('/',              adminOnly, getAll);
router.patch('/:id/read',    adminOnly, markRead);
router.delete('/:id',        adminOnly, remove);

module.exports = router;
