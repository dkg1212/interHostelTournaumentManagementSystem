const db = require('../config/db');

// Create notification (only DSW or TUSC)
const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    const senderId = req.user.id; // Assumes req.user is populated by auth middleware

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    // New notifications are globally unread by default
    // Your table already defaults is_read to FALSE, so explicitly setting it is optional but good for clarity
    await db.query(
      'INSERT INTO notifications (title, message, user_id, is_read) VALUES (?, ?, ?, FALSE)',
      [title, message, senderId]
    );

    res.status(201).json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Error sending notification', error: error.message });
  }
};

// Get all notifications with sender info and global read status
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT n.id, n.title, n.message, n.created_at, n.is_read,
              u.name AS sender_name, u.role AS sender_role
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC`
    );

    res.status(200).json({ success: true, total: notifications.length, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// Get globally unread notification count
const getUnreadNotificationCount = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT COUNT(*) as unreadCount FROM notifications WHERE is_read = FALSE`
    );

    const unreadCount = result.length > 0 ? result[0].unreadCount : 0;
    res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ success: false, message: 'Error fetching unread notification count', error: error.message });
  }
};

// Mark ALL unread notifications as globally read (e.g., by an admin)
const markAllNotificationsAsRead = async (req, res) => {
  try {
    // This action should typically be restricted to admin roles via middleware on the route
    const [result] = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE'
    );

    res.status(200).json({ success: true, message: 'All unread notifications marked as read globally.', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error marking all notifications as read', error: error.message });
  }
};

// Delete a notification (e.g., by an admin)
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    // Authorization (e.g., role check) should be handled by middleware on the route

    if (!notificationId) {
      return res.status(400).json({ success: false, message: 'Notification ID is required.' });
    }

    // Check if notification exists before trying to delete
    const [notificationExists] = await db.query('SELECT id FROM notifications WHERE id = ?', [notificationId]);
    if (notificationExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [notificationId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
    } else {
      // This case might be redundant due to the existence check, but good for robustness
      res.status(404).json({ success: false, message: 'Notification not found or already deleted.' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead, // Renamed for clarity of global action
  deleteNotification
};