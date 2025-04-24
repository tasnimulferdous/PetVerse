const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  content: { type: String, required: true, maxlength: 280 },
  timestamp: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  user: { type: String, required: true },
  content: { type: String, required: true, maxlength: 280 },
  timestamp: { type: Date, default: Date.now },
  likes: [{ type: String }], // array of user identifiers who liked the post
  comments: [commentSchema], // array of comments
  image: { type: String }, // image filename or URL
});

module.exports = mongoose.model('Post', postSchema);
