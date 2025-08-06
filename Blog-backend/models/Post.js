const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    imagePosition: { type: String, default: 'top' },
    imageWidth: { type:String, default: '100' },
    showOnHome: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isMostRead: { type: Boolean, default: false },
}, { timestamps: true }); // timestamps adds createdAt and updatedAt

module.exports = mongoose.model('Post', postSchema);