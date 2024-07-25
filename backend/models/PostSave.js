const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSaveSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'postType'
  },
  postType: {
    type: String,
    required: true,
    enum: ['Query', 'Perspective']
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

const PostSave = mongoose.model('PostSave', postSaveSchema);

module.exports = PostSave;
