// src/controllers/coursesController.js
const Course      = require('../models/Course');
const Enrollment  = require('../models/Enrollment');

// ── GET /courses ──────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { search, semester, year, department } = req.query;
    const filter = {};
    if (semester   && semester   !== 'all') filter.semester   = semester;
    if (year       && year       !== 'all') filter.year       = year;
    if (department && department !== 'all') filter.department = department;
    if (search) {
      filter.$or = [
        { title:      { $regex: search, $options: 'i' } },
        { code:       { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
      ];
    }
    const courses = await Course.find(filter).select('-weeks').sort({ year: -1, semester: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /courses/:id ──────────────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid course ID' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── POST /courses/:id/enroll ──────────────────────────────────────────────────
exports.enroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Enrollment.findOne({ user: req.user.userId, course: req.params.id });
    if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

    const enrollment = await Enrollment.create({ user: req.user.userId, course: req.params.id });
    await enrollment.populate('course', '-weeks');
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DELETE /courses/:id/enroll ────────────────────────────────────────────────
exports.unenroll = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({ user: req.user.userId, course: req.params.id });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ message: 'Successfully unenrolled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /courses/:id/lessons/:lessonId/complete ─────────────────────────────
exports.completeLesson = async (req, res) => {
  try {
    const { id: courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({ user: req.user.userId, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found — enroll in this course first' });
    }

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const course = await Course.findById(courseId);
    if (course && course.totalLectures > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedLessons.length / course.totalLectures) * 100
      );
      if (enrollment.progress >= 100) {
        enrollment.status      = 'Completed';
        enrollment.completedAt = new Date();
      }
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
