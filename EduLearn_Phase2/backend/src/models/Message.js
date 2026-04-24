// src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name:    { type: String, default: '' },   // sender display name
    email:   { type: String, default: '' },   // sender email
    subject: { type: String, required: true, trim: true },
    body:    { type: String, required: true },
    course:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
