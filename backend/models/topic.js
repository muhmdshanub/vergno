const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Define the schema for the topics collection
const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Apply the plugin for pagination
topicSchema.plugin(mongoosePaginate);

// Create the model from the schema
const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
