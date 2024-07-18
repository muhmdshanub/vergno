const mongoose = require('mongoose');
const Query = require('./query')
const Perspective = require('./perspective')
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  message: { type: String },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  metadata: { type: Map, of: Schema.Types.Mixed } // Flexible metadata field
});

// Apply the plugin for pagination
notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
