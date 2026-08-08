import Notification from '../models/Notification.js';
import { jsonDb } from '../utils/jsonDb.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    let notifications = [];
    const role = req.user.role;
    const userId = req.user._id;

    if (global.dbConnected) {
      if (role === 'admin') {
        notifications = await Notification.find({ roleRecipient: 'admin' }).sort({ createdAt: -1 });
      } else if (role === 'worker') {
        notifications = await Notification.find({ roleRecipient: 'worker' }).sort({ createdAt: -1 });
      } else {
        // Customer - find specific to user or 'customer' role recipient
        notifications = await Notification.find({ 
          $or: [
            { userId: userId },
            { roleRecipient: 'customer', userId: null }
          ]
        }).sort({ createdAt: -1 });
      }
    } else {
      // JSON DB Flow
      const allNotif = jsonDb.find('notifications');
      if (role === 'admin') {
        notifications = allNotif.filter(n => n.roleRecipient === 'admin');
      } else if (role === 'worker') {
        notifications = allNotif.filter(n => n.roleRecipient === 'worker');
      } else {
        notifications = allNotif.filter(n => 
          n.userId === userId.toString() || (n.roleRecipient === 'customer' && !n.userId)
        );
      }
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    if (global.dbConnected) {
      const notification = await Notification.findById(id);
      if (notification) {
        notification.read = true;
        await notification.save();
        res.json({ message: 'Notification marked as read' });
      } else {
        res.status(404).json({ message: 'Notification not found' });
      }
    } else {
      const notification = jsonDb.findById('notifications', id);
      if (notification) {
        jsonDb.findByIdAndUpdate('notifications', id, { read: true });
        res.json({ message: 'Notification marked as read' });
      } else {
        res.status(404).json({ message: 'Notification not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
