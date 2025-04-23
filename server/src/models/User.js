const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favouritePet: { type: String, required: true },
  adoptionRequests: [{
    requesterName: { type: String, required: true },
    petType: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    timestamp: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
