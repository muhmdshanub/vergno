const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const perspectiveCommentSchema = new Schema({
  commented_by: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  parent_perspective: {
    type: Schema.Types.ObjectId,
    ref: 'Perspective', // Assuming you have a Perspective model
    required: true
  },
  is_reply: {
    type: Boolean,
    default: false
  },
  parent_comment: {
    type: Schema.Types.ObjectId,
    ref: 'PerspectiveComment', // Self-reference
    default: null
  },
  comment_content: {
    type: String,
    required: true,
    trim: true
  },
  commented_at: {
    type: Date,
    default: Date.now
  },
  is_blocked: {
    type: Boolean,
    default: false
  },
  like_count: {
    type: Number,
    default: 0
  },
  reply_count: {
    type: Number,
    default: 0
  }
});

const PerspectiveComment = mongoose.model('PerspectiveComment', perspectiveCommentSchema);

module.exports = PerspectiveComment;
