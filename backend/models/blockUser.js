const mongoose = require('mongoose');

const blockUserSchema = new mongoose.Schema({
  blocking_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blocked_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const BlockUser = mongoose.model('BlockUser', blockUserSchema);

module.exports = BlockUser;
