const mongoose = require('mongoose');
const User = require("./user.js");
const Schema = mongoose.Schema;

const querySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    public_id: {
      type: String,
      required: function() {
        return this.image && this.image.url; // Require if image field is present and url is present
      }
    },
    url: {
      type: String,
      required: function() {
        return this.image && this.image.public_id; // Require if image field is present and public_id is present
      }
    },
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic', // Assuming you have a Topic model
    required: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
 answerCount: {
    type: Number,
    default: 0
  },
  posted_at: {
    type: Date,
    default: Date.now
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
});

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
