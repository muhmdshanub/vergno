const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  answered_by: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  parent_query: {
    type: Schema.Types.ObjectId,
    ref: 'Query', // Assuming you have a Query model
    required: true
  },
  answer_content: {
    type: String,
    required: true,
    trim: true
  },
  answered_at: {
    type: Date,
    default: Date.now
  },
  isHelpful: {
    type: Boolean,
    default: false
  },
  isBlocked:{
    type: Boolean,
    default: false
  }
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
