// models/themeModel.js
const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  backgound_color: {
    type: String,
    required: true,
  },
  backgound_image: {
    type: String,
    required: true,
  },
});

const Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;
