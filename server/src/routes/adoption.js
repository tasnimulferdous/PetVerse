// Existing imports
const express = require('express');
const multer = require('multer');
const path = require('path');
const AdoptionPost = require('../models/AdoptionPost');
const Notification = require('../models/Notification');
const User = require('../models/User');

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
router.get('/adoption', async (req, res) => {
  try {
    const { petType, location } = req.query;
    const filter = {};
    if (petType) {
      filter.petType = petType;
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' }; // case-insensitive partial match
    }
    const posts = await AdoptionPost.find(filter).sort({ timestamp: -1 });
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

// Request adoption for a post and create notification
router.post('/adoption/:postId/request', async (req, res) => {
  try {
    const { postId } = req.params;
    const { requesterId, requesterName, petType, description, location, imageUrl } = req.body;

    const post = await AdoptionPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    //notification for post owner

    let userObjectId = null;
    if (post.userId) {
      userObjectId = post.userId;
    } else if (post.user) {
 
      const user = await User.findOne({ name: post.user });
      if (user) {
        userObjectId = user._id;
      } else {
        return res.status(400).json({ message: 'Post owner user not found' });
      }
    } else {
      return res.status(400).json({ message: 'Post owner user information missing' });
    }

    if (!requesterId) {
      return res.status(400).json({ message: 'RequesterId is required' });
    }

    const notification = new Notification({
      userId: userObjectId,
      requesterId,
      requesterName,
      postId: post._id,
      petType,
      description,
      location,
      imageUrl,
      status: 'pending',
      timestamp: new Date(),
    });

    await notification.save();

    res.status(201).json({ message: 'Adoption request sent and notification created' });
  } catch (error) {
    console.error('Failed to send adoption request', error);
    res.status(500).json({ message: 'Failed to send adoption request' });
  }
});

// DELETE an adoption post by ID with ownership verification
router.delete('/adoption/:id', async (req, res) => {
  const postId = req.params.id;
  const { user } = req.body;

  if (!user) {
    return res.status(400).json({ message: 'User is required for deletion' });
  }

  try {
    const post = await AdoptionPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Adoption post not found' });
    }

    if (post.user !== user) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await AdoptionPost.findByIdAndDelete(postId);
    res.json({ message: 'Adoption post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete adoption post' });
  }
});

module.exports = router;
