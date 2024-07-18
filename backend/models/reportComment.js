const mongoose = require('mongoose');

const reportCommentSchema = new mongoose.Schema({
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  comment_type: {
    type: String,
    enum: ['queryComment', 'perspectiveComment'],
    required: true
  },
  comment_source: {
    type: String,
    enum: ['user_profile', 'group'],
    required: true
  },
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'comment_type'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const ReportComment = mongoose.model('ReportComment', reportCommentSchema);

module.exports = ReportComment;
