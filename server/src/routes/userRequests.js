// Existing imports
const express = require('express');
const Notification = require('../models/Notification');

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

module.exports = router;
