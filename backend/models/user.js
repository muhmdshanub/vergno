const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');


const userSchema = mongoose.Schema(
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
    phone: {
      type: String,
    },
    dob: {
      type: Date,
    },
    lastBirthdayEmailSent:  {
      type: Date,
    },
    gender: {
      type: String,
    },
    nationality: {
      type: String,
    },
    googleProfilePicture:{
      type: String,
    },
    googleId:{
      type: String,
    },
    groups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }],
    isOnline: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDiscoverEnabled :{
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
  
);


// Apply the plugin for pagination
userSchema.plugin(mongoosePaginate);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports =  User;
