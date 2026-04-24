// src/controllers/messagesController.js
const Message = require('../models/Message');
const User    = require('../models/User');

// ── POST /messages ─────────────────────────────────────────────────────────────
// Student sends a message to admins
exports.send = async (req, res) => {
  try {
    const { subject, body, name, email, courseId } = req.body;
    if (!subject || !body) return res.status(400).json({ message: 'Subject and body are required' });

    const user = await User.findById(req.user.userId).select('name email');
    const msg  = await Message.create({
      from:    req.user.userId,
      name:    name  || user?.name  || '',
      email:   email || user?.email || '',
      subject,
      body,
      course:  courseId || null,
    });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /messages ──────────────────────────────────────────────────────────────
// Admin: get all messages
exports.getAll = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('from',   'name email role')
      .populate('course', 'title code')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /messages/:id/read ───────────────────────────────────────────────────
// Admin: mark a message as read
exports.markRead = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DELETE /messages/:id ───────────────────────────────────────────────────────
// Admin: delete a message
exports.remove = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
