const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queryCommentLikeSchema = new Schema({
  comment_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Comment' // Assuming you have a Query model
  },
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Assuming you have a User model
  },
  liked_at: {
    type: Date,
    default: Date.now,
  }
});

// Compound index to optimize query performance
queryCommentLikeSchema.index({ comment_id: 1, user_id: 1 }, { unique: true });

const QueryCommentLike = mongoose.model('QueryCommentLike', queryCommentLikeSchema);

module.exports = QueryCommentLike;
