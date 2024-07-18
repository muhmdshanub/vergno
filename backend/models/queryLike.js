const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queryLikeSchema = new Schema({
  query_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Query' // Assuming you have a Query model
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
queryLikeSchema.index({ query_id: 1, user_id: 1 }, { unique: true });

const QueryLike = mongoose.model('QueryLike', queryLikeSchema);

module.exports = QueryLike;
