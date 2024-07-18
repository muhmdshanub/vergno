const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
  text: { type: String },
  media_url: { type: String },
  sent_at: { type: Date, default: Date.now },
  is_read: { type: Boolean, default: false },
  received_at: { type: Date },
  read_at: { type: Date },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
