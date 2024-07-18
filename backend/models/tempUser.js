const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      index: { expires: '3m' }, // TTL index, documents will be automatically deleted after 3 minutes
    },
  },
  {
    timestamps: true,
  }
);

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports =  TempUser;
