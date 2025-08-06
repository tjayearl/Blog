const mongoose = require('mongoose');

const multimediaSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['video', 'gallery', 'podcast'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String },
    thumbnailUrl: { type: String, required: true },
    contentUrl: { type: String, required: true }, // e.g., YouTube embed link, gallery page link, audio file link
}, { timestamps: true });

module.exports = mongoose.model('Multimedia', multimediaSchema);