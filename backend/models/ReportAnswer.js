const mongoose = require('mongoose');

const reportAnswerSchema = new mongoose.Schema({
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  answer_source: {
    type: String,
    enum: ['user_profile', 'group'],
    required: true
  },
  answer_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'answer_type'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const ReportAnswer = mongoose.model('ReportAnswer', reportAnswerSchema);

module.exports = ReportAnswer;
