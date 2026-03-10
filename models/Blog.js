const mongoose = require ('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
      photo: String,
      video: String,
    reads:{
        type: Number,
        default: 0
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    
    createdAt: { type: Date, default: Date.now },

},{timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);