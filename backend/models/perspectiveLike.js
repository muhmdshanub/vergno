const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const perspectiveLikeSchema = new Schema({
  perspective_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Perspective' // Assuming you have a Perspective model
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
perspectiveLikeSchema.index({ perspective_id: 1, user_id: 1 }, { unique: true });

const PerspectiveLike = mongoose.model('PerspectiveLike', perspectiveLikeSchema);

module.exports = PerspectiveLike;
