const mongoose = require('mongoose');

const reportPostSchema = new mongoose.Schema({
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  post_type: {
    type: String,
    enum: ['query', 'perspective'],
    required: true
  },
  post_source: {
    type: String,
    enum: ['user_profile', 'group'],
    required: true
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'source' // Assuming 'source' determines the collection for post_id
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const ReportPost = mongoose.model('ReportPost', reportPostSchema);

module.exports = ReportPost;
