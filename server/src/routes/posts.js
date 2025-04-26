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

// Delete a comment
router.delete('/posts/:postId/comment/:commentId', async (req, res) => {
  const { postId, commentId } = req.params;
  const user = req.query.user;
  if (!user) {
    return res.status(400).json({ message: 'User is required' });
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
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }
    // Remove comment manually from comments array
    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

const stopWords = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can't", "cannot", "could", "couldn't",
  "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each",
  "few", "for", "from", "further",
  "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
  "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's",
  "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not",
  "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
  "under", "until", "up",
  "very",
  "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

router.get('/posts/trending', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPosts = await Post.find({ timestamp: { $gte: twentyFourHoursAgo } });

    const wordCounts = {};
    recentPosts.forEach(post => {
      if (post.content) {
        // Extract words, convert to lowercase, remove non-alphabetic characters
        const words = post.content.toLowerCase().match(/\b[a-z]+\b/g);
        if (words) {
          words.forEach(word => {
            if (!stopWords.has(word)) {
              wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
          });
        }
      }
    });

    // Sort words by frequency descending
    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

    // Take top 3 words
    const top3 = sortedWords.slice(0, 3).map(entry => entry[0]);

    res.json({ trendingTopics: top3 });
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    res.status(500).json({ message: 'Failed to fetch trending topics' });
  }
});

module.exports = router;
