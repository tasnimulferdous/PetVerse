const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get adoption requests for logged-in user
router.get('/users/:userId/adoption-requests', async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.adoptionRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get adoption requests' });
  }
});

// Add an adoption request to a user
router.post('/users/:userId/adoption-requests', async (req, res) => {
  const userId = req.params.userId;
  const { requesterId, requesterName, petType, description, location, imageUrl, postId } = req.body;
  if (!requesterId || !requesterName || !petType || !description || !location || !imageUrl || !postId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.adoptionRequests.push({ requesterId, requesterName, petType, description, location, imageUrl, postId, status: 'pending' });
    await user.save();
    res.status(201).json({ message: 'Adoption request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send adoption request' });
  }
});

// Approve an adoption request
router.patch('/users/:userId/adoption-requests/:requestId', async (req, res) => {
  const { userId, requestId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const request = user.adoptionRequests.id(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'approved';
    await user.save();
    res.json({ message: 'Adoption request approved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve adoption request' });
  }
});

// Get adoption requests sent by a user
router.get('/users/:userId/sent-adoption-requests', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find all users who have adoptionRequests from this user
    const users = await User.find({ 'adoptionRequests.requesterId': userId });
    let sentRequests = [];
    users.forEach(user => {
      user.adoptionRequests.forEach(request => {
        if (request.requesterId && request.requesterId.toString() === userId) {
          sentRequests.push({
            _id: request._id,
            postId: request.postId || null,
            status: request.status,
          });
        }
      });
    });
    res.json(sentRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get sent adoption requests' });
  }
});

module.exports = router;
