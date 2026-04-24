// src/seed.js
// Run once: node src/seed.js
//
// Creates:
//   Admin     → admin@edulearn.com   / Admin@123
//   Instructor → instructor@edulearn.com / Instructor@123
//   Student   → student@edulearn.com  / Student@123
//
// Then seeds courses (linked to the instructor) and quizzes.

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const connectDB = require('./db');
const User      = require('./models/User');
const Course    = require('./models/Course');
const Quiz      = require('./models/Quiz');

// ── Seed users ────────────────────────────────────────────────────────────────

const seedUsers = [
  {
    name:  'Admin User',
    email: 'admin@edulearn.com',
    password: 'Admin@123',
    role:  'admin',
    bio:   'Platform administrator with full access.',
    phone: '+20-100-000-0001',
  },
  {
    name:  'Dr. Sarah Johnson',
    email: 'instructor@edulearn.com',
    password: 'Instructor@123',
    role:  'instructor',
    bio:   'Senior lecturer in Computer Science with 10+ years of teaching experience.',
    phone: '+20-100-000-0002',
  },
  {
    name:  'Ahmed Ali',
    email: 'student@edulearn.com',
    password: 'Student@123',
    role:  'student',
    bio:   'Computer Science undergraduate, year 3.',
    phone: '+20-100-000-0003',
  },
];

// ── Seed courses (will be linked to the instructor by ID) ─────────────────────

function buildCourses(instructorId, instructorName) {
  return [
    {
      title:             'Advanced Database Systems',
      code:              'CS401',
      instructor:        instructorName,
      instructorId,
      semester:          'Fall',
      year:              '2023',
      department:        'Computer Science',
      description:       'A deep dive into advanced database concepts including query optimization, transaction management, distributed databases, and NoSQL systems.',
      duration:          '15 Weeks',
      totalLectures:     4,
      completedLectures: 4,
      weeks: [
        {
          weekNumber: 1,
          title: 'Relational Model & SQL Review',
          lessons: [
            { lessonId: '1-1', title: 'ER Diagrams & Normalization', duration: '50 min', status: 'completed', description: 'Review of entity-relationship diagrams and database normalization forms.' },
            { lessonId: '1-2', title: 'Advanced SQL Queries',        duration: '60 min', status: 'completed', description: 'Window functions, CTEs, and complex joins.' },
          ],
        },
        {
          weekNumber: 2,
          title: 'Query Optimization',
          lessons: [
            { lessonId: '2-1', title: 'Query Execution Plans', duration: '55 min', status: 'completed' },
            { lessonId: '2-2', title: 'Indexing Strategies',   duration: '50 min', status: 'completed' },
          ],
        },
      ],
    },
    {
      title:             'Machine Learning Fundamentals',
      code:              'CS402',
      instructor:        instructorName,
      instructorId,
      semester:          'Fall',
      year:              '2023',
      department:        'Computer Science',
      description:       'Introduction to machine learning algorithms, model evaluation, feature engineering, and practical applications using Python and scikit-learn.',
      duration:          '16 Weeks',
      totalLectures:     4,
      completedLectures: 4,
      weeks: [
        {
          weekNumber: 1,
          title: 'Introduction to ML',
          lessons: [
            { lessonId: '1-1', title: 'What is Machine Learning?',    duration: '45 min', status: 'completed', description: 'Overview of ML types: supervised, unsupervised, reinforcement learning.' },
            { lessonId: '1-2', title: 'Python for ML — numpy/pandas', duration: '60 min', status: 'completed' },
          ],
        },
        {
          weekNumber: 2,
          title: 'Supervised Learning',
          lessons: [
            { lessonId: '2-1', title: 'Linear & Logistic Regression',    duration: '55 min', status: 'completed' },
            { lessonId: '2-2', title: 'Decision Trees & Random Forests', duration: '60 min', status: 'completed' },
          ],
        },
      ],
    },
    {
      title:             'Software Engineering Principles',
      code:              'CS301',
      instructor:        instructorName,
      instructorId,
      semester:          'Spring',
      year:              '2023',
      department:        'Computer Science',
      description:       'Covers software development lifecycle, design patterns, agile methodologies, testing strategies, and version control best practices.',
      duration:          '14 Weeks',
      totalLectures:     4,
      completedLectures: 3,
      weeks: [
        {
          weekNumber: 1,
          title: 'SDLC & Agile',
          lessons: [
            { lessonId: '1-1', title: 'Waterfall vs Agile',  duration: '45 min', status: 'completed' },
            { lessonId: '1-2', title: 'Scrum & Kanban',      duration: '50 min', status: 'completed' },
          ],
        },
        {
          weekNumber: 2,
          title: 'Design Patterns',
          lessons: [
            { lessonId: '2-1', title: 'Creational Patterns',  duration: '55 min', status: 'completed' },
            { lessonId: '2-2', title: 'Structural Patterns',  duration: '50 min', status: 'current'   },
          ],
        },
      ],
    },
    {
      title:             'Web Development Technologies',
      code:              'CS302',
      instructor:        instructorName,
      instructorId,
      semester:          'Fall',
      year:              '2022',
      department:        'Computer Science',
      description:       'Covers modern web development with HTML5, CSS3, JavaScript, React, and Node.js.',
      duration:          '13 Weeks',
      totalLectures:     5,
      completedLectures: 5,
      weeks: [
        {
          weekNumber: 1,
          title: 'HTML & CSS Foundations',
          lessons: [
            { lessonId: '1-1', title: 'Semantic HTML5',           duration: '40 min', status: 'completed' },
            { lessonId: '1-2', title: 'CSS Flexbox & Grid',       duration: '50 min', status: 'completed' },
            { lessonId: '1-3', title: 'Responsive Design Basics', duration: '45 min', status: 'completed' },
          ],
        },
        {
          weekNumber: 2,
          title: 'JavaScript Essentials',
          lessons: [
            { lessonId: '2-1', title: 'ES6+ Features',   duration: '55 min', status: 'completed' },
            { lessonId: '2-2', title: 'DOM Manipulation', duration: '50 min', status: 'completed' },
          ],
        },
      ],
    },
    {
      title:             'Operating Systems',
      code:              'CS303',
      instructor:        instructorName,
      instructorId,
      semester:          'Spring',
      year:              '2022',
      department:        'Computer Science',
      description:       'Study of OS concepts including process management, memory management, file systems, concurrency, and security.',
      duration:          '15 Weeks',
      totalLectures:     4,
      completedLectures: 4,
      weeks: [
        {
          weekNumber: 1,
          title: 'Process Management',
          lessons: [
            { lessonId: '1-1', title: 'Processes & Threads', duration: '55 min', status: 'completed', description: 'Understanding process states, PCB, and thread models.' },
            { lessonId: '1-2', title: 'CPU Scheduling',       duration: '60 min', status: 'completed' },
          ],
        },
        {
          weekNumber: 2,
          title: 'Memory Management',
          lessons: [
            { lessonId: '2-1', title: 'Virtual Memory',        duration: '60 min', status: 'completed' },
            { lessonId: '2-2', title: 'Paging & Segmentation', duration: '55 min', status: 'completed' },
          ],
        },
      ],
    },
  ];
}

// ── Seed quizzes ──────────────────────────────────────────────────────────────

const quizzes = [
  {
    title:       'React Fundamentals Quiz',
    description: 'Test your knowledge of React basics and core concepts',
    timeLimit:   600,
    questions: [
      { questionId: 1,  type: 'multiple-choice', question: 'What is React?',                                                                         options: ['A JavaScript library for building user interfaces', 'A database management system', 'A CSS framework', 'A server-side programming language'], correctAnswer: 'A JavaScript library for building user interfaces' },
      { questionId: 2,  type: 'true-false',      question: 'React uses a virtual DOM to improve performance.',                                        options: ['True', 'False'],                                                                                                                               correctAnswer: 'True'  },
      { questionId: 3,  type: 'multiple-choice', question: 'Which hook is used to manage state in functional components?',                            options: ['useEffect', 'useState', 'useContext', 'useReducer'],                                                                                         correctAnswer: 'useState' },
      { questionId: 4,  type: 'short-answer',    question: 'What does JSX stand for?',                                                                                                                                                                                                                 correctAnswer: 'JavaScript XML' },
      { questionId: 5,  type: 'multiple-choice', question: 'What is the purpose of useEffect hook?',                                                  options: ['To manage component state', 'To handle side effects in functional components', 'To create context', 'To optimize performance'],          correctAnswer: 'To handle side effects in functional components' },
      { questionId: 6,  type: 'true-false',      question: 'Props in React are mutable.',                                                             options: ['True', 'False'],                                                                                                                       correctAnswer: 'False' },
      { questionId: 7,  type: 'multiple-choice', question: 'Which method is used to update state in class components?',                               options: ['updateState()', 'setState()', 'changeState()', 'modifyState()'],                                                                        correctAnswer: 'setState()' },
      { questionId: 8,  type: 'multiple-choice', question: 'What is the correct way to pass data from parent to child component?',                    options: ['Using state', 'Using props', 'Using context', 'Using refs'],                                                                           correctAnswer: 'Using props' },
      { questionId: 9,  type: 'true-false',      question: 'React components must return multiple elements without a wrapper.',                        options: ['True', 'False'],                                                                                                                       correctAnswer: 'False' },
      { questionId: 10, type: 'short-answer',    question: 'What is the name of the React feature that allows you to share logic between components?',                                                                                                                                                  correctAnswer: 'Hooks' },
    ],
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────

async function seed() {
  await connectDB();
  try {
    // 1. Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    console.log('✓ Cleared existing users, courses and quizzes');

    // 2. Hash passwords and insert users
    const usersWithHash = await Promise.all(
      seedUsers.map(async u => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );
    const insertedUsers = await User.insertMany(usersWithHash);

    const admin      = insertedUsers.find(u => u.role === 'admin');
    const instructor = insertedUsers.find(u => u.role === 'instructor');
    const student    = insertedUsers.find(u => u.role === 'student');

    console.log(`✓ Seeded ${insertedUsers.length} users`);
    console.log(`  👤 Admin:      ${admin.email}      / Admin@123`);
    console.log(`  👤 Instructor: ${instructor.email} / Instructor@123`);
    console.log(`  👤 Student:    ${student.email}    / Student@123`);

    // 3. Insert courses linked to the instructor
    const courses = buildCourses(instructor._id, instructor.name);
    const insertedCourses = await Course.insertMany(courses);
    console.log(`✓ Seeded ${insertedCourses.length} courses (linked to ${instructor.name})`);

    // 4. Insert quizzes (linked to first course)
    // Link React quiz to Web Development course (index 3 = CS302) and mark as course-specific
  // Also add a global entry quiz visible to everyone
  const webCourse = insertedCourses.find(c => c.code === 'CS302') || insertedCourses[0];
  const quizzesWithCourse = [
    { ...quizzes[0], course: webCourse._id, isGlobal: false },
    {
      title: 'General Programming Entry Quiz',
      description: 'A baseline quiz to assess your programming fundamentals. Available to all students.',
      timeLimit: 300,
      isGlobal: true,
      course: null,
      questions: [
        { questionId: 1, type: 'multiple-choice', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correctAnswer: 'Central Processing Unit' },
        { questionId: 2, type: 'true-false', question: 'An algorithm must always be written in a programming language.', options: ['True', 'False'], correctAnswer: 'False' },
        { questionId: 3, type: 'multiple-choice', question: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correctAnswer: 'Stack' },
        { questionId: 4, type: 'true-false', question: 'RAM is a type of permanent storage.', options: ['True', 'False'], correctAnswer: 'False' },
        { questionId: 5, type: 'multiple-choice', question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 'O(log n)' },
      ],
    },
  ];
    await Quiz.insertMany(quizzesWithCourse);
    console.log(`✓ Seeded ${quizzes.length} quizzes`);

    console.log('\n🎉 Database seeded successfully!\n');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

seed();
