const User = require('../../models/User');
const Post = require('../../models/Post');
const AdoptionPost = require('../../models/AdoptionPost');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Find user by id
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const username = user.name;
    // Delete all posts by username
    await Post.deleteMany({ user: username });
    // Delete all adoption posts by username
    await AdoptionPost.deleteMany({ user: username });
    // Delete user
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({});
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    await Post.findByIdAndDelete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New methods for Adoption Posts
exports.getAllAdoptionPosts = async (req, res) => {
  try {
    const adoptionPosts = await AdoptionPost.find({});
    res.json(adoptionPosts);
  } catch (error) {
    console.error('Error fetching adoption posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteAdoptionPost = async (req, res) => {
  try {
    const postId = req.params.id;
    await AdoptionPost.findByIdAndDelete(postId);
    res.json({ message: 'Adoption post deleted successfully' });
  } catch (error) {
    console.error('Error deleting adoption post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
