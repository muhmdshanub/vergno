const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  otpVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date }, // New field to store the time of verification
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
