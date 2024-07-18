const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  following_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followed_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_accepted: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
