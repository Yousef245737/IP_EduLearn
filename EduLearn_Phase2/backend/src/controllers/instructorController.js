// src/controllers/instructorController.js
const Course     = require('../models/Course');
const Quiz       = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment  = require('../models/Enrollment');

// Helper: verify this course belongs to the logged-in instructor
async function ownCourse(courseId, instructorId) {
  const course = await Course.findById(courseId);
  if (!course) return null;
  // Match by instructorId field (ObjectId) OR by instructor name fallback
  if (course.instructorId && course.instructorId.toString() !== instructorId) return null;
  return course;
}

// ─── COURSES ──────────────────────────────────────────────────────────────────

// GET /instructor/courses  — list courses assigned to this instructor
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user.userId }).select('-weeks').sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /instructor/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructorId: req.user.userId });
    if (!course) return res.status(404).json({ message: 'Course not found or access denied' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /instructor/courses/:id  — update title, description, weeks, lessons
exports.updateCourse = async (req, res) => {
  try {
    const allowed = ['title', 'description', 'duration', 'totalLectures', 'weeks'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructorId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found or access denied' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /instructor/courses/:id/students — enrolled students
exports.getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructorId: req.user.userId });
    if (!course) return res.status(404).json({ message: 'Course not found or access denied' });

    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate('user', 'name email profilePicture')
      .sort({ enrolledAt: -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── QUIZZES ──────────────────────────────────────────────────────────────────

// GET /instructor/courses/:id/quizzes
exports.getCourseQuizzes = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructorId: req.user.userId });
    if (!course) return res.status(404).json({ message: 'Course not found or access denied' });

    const quizzes = await Quiz.find({ course: req.params.id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /instructor/courses/:id/quizzes — create a quiz
exports.createQuiz = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructorId: req.user.userId });
    if (!course) return res.status(404).json({ message: 'Course not found or access denied' });

    const { title, description, timeLimit, questions, dueDate } = req.body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0)
      return res.status(400).json({ message: 'title and questions[] are required' });

    const quiz = await Quiz.create({
      course: req.params.id,
      title,
      description: description || '',
      timeLimit:   timeLimit   || 30,
      questions,
      dueDate:     dueDate     || null,
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /instructor/quizzes/:quizId
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('course', 'title instructorId');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.course.instructorId?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Access denied' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /instructor/quizzes/:quizId
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('course', 'instructorId');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.course.instructorId?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Access denied' });

    const allowed = ['title', 'description', 'timeLimit', 'questions', 'dueDate'];
    allowed.forEach(f => { if (req.body[f] !== undefined) quiz[f] = req.body[f]; });
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /instructor/quizzes/:quizId
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('course', 'instructorId');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.course.instructorId?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Access denied' });

    await Quiz.findByIdAndDelete(req.params.quizId);
    await QuizAttempt.deleteMany({ quiz: req.params.quizId });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /instructor/quizzes/:quizId/results — student attempt results
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('course', 'instructorId');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.course.instructorId?.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Access denied' });

    const attempts = await QuizAttempt.find({ quiz: req.params.quizId })
      .populate('user', 'name email')
      .sort({ submittedAt: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
