const express = require('express');
const multer = require('multer');
const path = require('path');
const AdoptionPost = require('../models/AdoptionPost');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all adoption posts with user ID included
const User = require('../models/User');

router.get('/adoption', async (req, res) => {
  try {
    const posts = await AdoptionPost.find().sort({ timestamp: -1 });
    // For each post, find the user ID by username
    const postsWithUserId = await Promise.all(posts.map(async (post) => {
      const user = await User.findOne({ name: post.user });
      return {
        _id: post._id,
        userId: user ? user._id : null,
        user: post.user,
        petType: post.petType,
        description: post.description,
        location: post.location,
        imageUrl: post.imageUrl,
        timestamp: post.timestamp,
      };
    }));
    res.json(postsWithUserId);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch adoption posts' });
  }
});

// Create a new adoption post
router.post('/adoption', upload.single('image'), async (req, res) => {
  const { user, petType, description, location } = req.body;
  if (!user || !petType || !description || !location || !req.file) {
    return res.status(400).json({ message: 'All fields and image are required' });
  }
  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    const newPost = new AdoptionPost({ user, petType, description, location, imageUrl });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create adoption post' });
  }
});

module.exports = router;
