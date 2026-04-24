// src/models/Course.js  (UPDATED — adds videoUrl to lessonSchema)
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  lessonId:    { type: String, required: true },
  title:       { type: String, required: true },
  duration:    { type: String, default: '' },
  status:      { type: String, enum: ['completed', 'current', 'locked'], default: 'locked' },
  description: { type: String, default: '' },
  videoUrl:    { type: String, default: '' },   // ← YouTube, Vimeo, or direct MP4 link
  resources: [
    { name: { type: String }, url: { type: String } },
  ],
}, { _id: false });

const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  title:      { type: String, required: true },
  lessons:    [lessonSchema],
}, { _id: false });

const courseSchema = new mongoose.Schema(
  {
    title:             { type: String, required: [true, 'Title is required'], trim: true },
    code:              { type: String, required: [true, 'Course code is required'], trim: true },
    instructor:        { type: String, required: [true, 'Instructor is required'], trim: true },
    instructorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    semester:          { type: String, required: true },
    year:              { type: String, required: true },
    department:        { type: String, default: 'Computer Science' },
    description:       { type: String, default: '' },
    duration:          { type: String, default: '' },
    totalLectures:     { type: Number, default: 0 },
    completedLectures: { type: Number, default: 0 },
    weeks:             [weekSchema],
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
