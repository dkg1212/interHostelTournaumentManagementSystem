const db = require('../config/db');

// Create notification (only DSW or TUSC)
const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    const senderId = req.user.id;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    await db.query(
      'INSERT INTO notifications (title, message, user_id) VALUES (?, ?, ?)',
      [title, message, senderId]
    );

    res.status(201).json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error sending notification', error: error.message });
  }
};

// Get all notifications with sender info
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT n.id, n.title, n.message, n.created_at,
              u.name AS sender_name, u.role AS sender_role
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC`
    );

    res.status(200).json({ success: true, total: notifications.length, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications
};
