// src/controllers/adminController.js
const bcrypt = require('bcryptjs');
const User       = require('../models/User');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Quiz       = require('../models/Quiz');

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

// GET /admin/users  — list all users with optional role filter
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /admin/users  — create instructor or student
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, bio } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email and password are required' });

    const allowedRoles = ['student', 'instructor', 'admin'];
    if (role && !allowedRoles.includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role: role || 'student', phone, bio });
    const obj    = user.toObject();
    delete obj.password;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /admin/users/:id  — update any user field (admin only)
exports.updateUser = async (req, res) => {
  try {
    const allowed = ['name', 'email', 'role', 'phone', 'dateOfBirth', 'bio', 'skills'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Clean up enrollments
    await Enrollment.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── COURSE MANAGEMENT ────────────────────────────────────────────────────────

// GET /admin/courses
exports.getAllCourses = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { code:        { $regex: search, $options: 'i' } },
        { instructor:  { $regex: search, $options: 'i' } },
      ];
    }
    const courses = await Course.find(filter).select('-weeks').sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /admin/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, code, instructor, semester, year, department, description, duration, totalLectures, weeks } = req.body;
    const course = await Course.create({ title, code, instructor, semester, year, department, description, duration, totalLectures: totalLectures || 0, weeks: weeks || [] });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /admin/courses/:id — full course with weeks
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /admin/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const allowed = ['title', 'code', 'instructor', 'semester', 'year', 'department', 'description', 'duration', 'totalLectures', 'weeks', 'instructorId'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /admin/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Enrollment.deleteMany({ course: req.params.id });
    await Quiz.deleteMany({ course: req.params.id });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── STATS ────────────────────────────────────────────────────────────────────

// GET /admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, instructorCount, studentCount] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'student' }),
    ]);
    res.json({ totalUsers, totalCourses, totalEnrollments, instructorCount, studentCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
