const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Create a new post
router.post('/posts', async (req, res) => {
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ message: 'User and content are required' });
  }
  try {
    const newPost = new Post({ user, content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Like or unlike a post
router.post('/posts/:id/like', async (req, res) => {
  const postId = req.params.id;
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ message: 'User is required to like a post' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const index = post.likes.indexOf(user);
    if (index === -1) {
      post.likes.push(user);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to like/unlike post' });
  }
});

// Add a comment to a post
router.post('/posts/:id/comment', async (req, res) => {
  const postId = req.params.id;
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ message: 'User and content are required to comment' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({ user, content });
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;
