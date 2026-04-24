// src/index.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./db');

const authRouter       = require('./routes/auth');
const usersRouter      = require('./routes/users');
const coursesRouter    = require('./routes/courses');
const examsRouter      = require('./routes/exams');
const quizzesRouter    = require('./routes/quizzes');
const messagesRouter   = require('./routes/messages');   // ← NEW
const adminRouter      = require('./routes/admin');
const instructorRouter = require('./routes/instructor');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  const ts = new Date().toISOString();
  res.on('finish', () => console.log(`[${ts}] ${req.method.padEnd(7)} ${req.originalUrl} → ${res.statusCode}`));
  next();
});

app.use('/auth',        authRouter);
app.use('/users',       usersRouter);
app.use('/courses',     coursesRouter);
app.use('/exams',       examsRouter);
app.use('/quizzes',     quizzesRouter);
app.use('/messages',    messagesRouter);    // ← NEW
app.use('/admin',       adminRouter);
app.use('/instructor',  instructorRouter);

app.get('/', (_req, res) => res.json({ message: 'EduLearn API is running ✓' }));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
});
