const mongoose = require('mongoose');

const topicFollowSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const TopicFollow = mongoose.model('TopicFollow', topicFollowSchema);

module.exports = TopicFollow;
