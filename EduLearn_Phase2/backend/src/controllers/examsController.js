// src/controllers/examsController.js  (UPDATED — merges global exams)
const { validationResult } = require('express-validator');
const Exam       = require('../models/Exam');
const Enrollment = require('../models/Enrollment');

// ── GET /exams ────────────────────────────────────────────────────────────────
// Returns personal exams + global exams for courses the student is enrolled in

exports.getAll = async (req, res) => {
  try {
    // 1. Personal exams
    const personalFilter = { user: req.user.userId, isGlobal: { $ne: true } };
    if (req.query.month) {
      const [year, month] = req.query.month.split('-').map(Number);
      personalFilter.date = { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) };
    }
    const personalExams = await Exam.find(personalFilter).sort({ date: 1 });

    // 2. Global exams for enrolled courses
    const enrollments = await Enrollment.find({ user: req.user.userId }).select('course');
    const courseIds   = enrollments.map(e => e.course);

    const globalFilter = { isGlobal: true, courseId: { $in: courseIds } };
    if (req.query.month) {
      const [year, month] = req.query.month.split('-').map(Number);
      globalFilter.date = { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) };
    }
    const globalExams = await Exam.find(globalFilter)
      .populate('courseId', 'title code')
      .sort({ date: 1 });

    // 3. Merge — tag global exams so frontend can distinguish them
    const merged = [
      ...personalExams.map(e => ({ ...e.toObject(), isGlobal: false })),
      ...globalExams.map(e => ({ ...e.toObject(), isGlobal: true })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /exams ───────────────────────────────────────────────────────────────
// Student creates a personal exam

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { subject, type, date, time, location, duration, notes, reminders } = req.body;
    const exam = await Exam.create({
      user:      req.user.userId,
      subject, type, date, time,
      location:  location  || '',
      duration:  duration  || '',
      notes:     notes     || '',
      reminders: reminders || { oneDayBefore: false, oneHourBefore: false },
      isGlobal:  false,
    });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /exams/:id ──────────────────────────────────────────────────────────
// Student updates their own personal exam only (cannot edit global ones)

exports.update = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user.userId, isGlobal: { $ne: true } });
    if (!exam) return res.status(404).json({ message: 'Exam not found or cannot edit admin-set exams' });

    const allowed = ['subject', 'type', 'date', 'time', 'location', 'duration', 'notes', 'reminders'];
    allowed.forEach(f => { if (req.body[f] !== undefined) exam[f] = req.body[f]; });
    await exam.save();
    res.json(exam);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid exam ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DELETE /exams/:id ─────────────────────────────────────────────────────────
// Student deletes their own personal exam only

exports.remove = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user.userId, isGlobal: { $ne: true } });
    if (!exam) return res.status(404).json({ message: 'Exam not found or cannot delete admin-set exams' });
    res.status(204).send();
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid exam ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Admin: POST /admin/exams ──────────────────────────────────────────────────
// Admin creates a global exam for a course

exports.adminCreate = async (req, res) => {
  try {
    const { subject, type, date, time, location, duration, notes, courseId } = req.body;
    if (!subject || !type || !date || !time) {
      return res.status(400).json({ message: 'subject, type, date and time are required' });
    }
    const exam = await Exam.create({
      user:      req.user.userId,
      createdBy: req.user.userId,
      subject, type, date, time,
      location:  location || '',
      duration:  duration || '',
      notes:     notes    || '',
      isGlobal:  true,
      courseId:  courseId || null,
      reminders: { oneDayBefore: false, oneHourBefore: false },
    });
    await exam.populate('courseId', 'title code');
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Admin: GET /admin/exams ───────────────────────────────────────────────────
exports.adminGetAll = async (req, res) => {
  try {
    const exams = await Exam.find({ isGlobal: true })
      .populate('courseId', 'title code')
      .sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Admin: PATCH /admin/exams/:id ─────────────────────────────────────────────
exports.adminUpdate = async (req, res) => {
  try {
    const allowed = ['subject', 'type', 'date', 'time', 'location', 'duration', 'notes', 'courseId'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const exam = await Exam.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('courseId', 'title code');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Admin: DELETE /admin/exams/:id ────────────────────────────────────────────
exports.adminRemove = async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
