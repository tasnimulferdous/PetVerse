const mongoose = require('mongoose');

const adoptionPostSchema = new mongoose.Schema({
  user: { type: String, required: true },
  petType: { type: String, required: true, enum: ['cat', 'dog', 'bird', 'fish', 'others'] },
  description: { type: String, required: true, maxlength: 500 },
  location: { type: String, required: true },
  imageUrl: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdoptionPost', adoptionPostSchema);
