const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  imagePosition: {
    type: String, // e.g., 'top', 'left', 'right'
    default: 'top',
  },
  imageWidth: {
    type: Number, // Percentage
    default: 100,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Blog", blogSchema);
