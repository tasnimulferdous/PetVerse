// Existing imports
const express = require('express');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const router = express.Router();

// Get notifications for a user
router.get('/users/:userId/notifications', async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ userId }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Update notification status (approve/deny)
router.patch('/users/notifications/:notificationId/status', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { status } = req.body;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.status = status;
    await notification.save();
    res.json({ message: `Notification status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification status' });
  }
});

// Delete a notification
router.delete('/users/notifications/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await Notification.findByIdAndDelete(notificationId);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Create notification for requester
router.post('/users/notifications', async (req, res) => {
  try {
    const {
      userId,
      requesterId,
      requesterName,
      postId,
      petType,
      description,
      location,
      imageUrl,
      status
    } = req.body;

    const notification = new Notification({
      userId,
      requesterId,
      requesterName,
      postId,
      petType,
      description,
      location,
      imageUrl,
      status,
      timestamp: new Date()
    });

    await notification.save();
    res.status(201).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Failed to create notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Get messages for a user
router.get('/users/:userId/messages', async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({ userId }).sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Delete a message
router.delete('/users/:userId/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// Update message status (approve/deny)
router.patch('/users/messages/:messageId/status', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.status = status;
    await message.save();
    res.json({ message: `Message status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update message status' });
  }
});

module.exports = router;
