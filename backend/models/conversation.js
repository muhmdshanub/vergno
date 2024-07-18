const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      unreadCount: { type: Number, default: 0 },
    }
  ],
  last_message: {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    sent_at: { type: Date }
  },
}, { timestamps: true });

// Method to ensure unreadCount does not go below zero for each participant
conversationSchema.methods.ensureUnreadCounts = function() {
  this.participants.forEach(participant => {
    if (participant.unreadCount < 0) {
      participant.unreadCount = 0;
    }
  });
};

conversationSchema.pre('save', function(next) {
  this.ensureUnreadCounts();
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
