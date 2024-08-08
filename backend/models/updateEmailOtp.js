const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  old_email: {
    type: String,
    required: true,
  },
  new_email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a TTL index on the `otpExpiresAt` field
otpSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailOtp = mongoose.model('EmailOtp', otpSchema);

module.exports = EmailOtp;
