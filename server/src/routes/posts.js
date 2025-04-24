const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

router.post('/posts', upload.single('image'), async (req, res) => {
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ message: 'User and content are required' });
  }
  try {
    const image = req.file ? req.file.filename : null;
    const newPost = new Post({ user, content, image });
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

// Update a post
router.put('/posts/:id', upload.single('image'), async (req, res) => {
  const postId = req.params.id;
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ message: 'User and content are required' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user !== user) {
      return res.status(403).json({ message: 'Unauthorized to update this post' });
    }
    post.content = content;
    if (req.file) {
      post.image = req.file.filename;
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ message: 'User is required' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user !== user) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }
    await Post.findByIdAndDelete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Update a comment
router.put('/posts/:postId/comment/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ message: 'User and content are required' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.user !== user) {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }
    comment.content = content;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update comment' });
  }
});



module.exports = router;
