const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead, // Use the renamed function
  deleteNotification
} = require('../controllers/notificationController'); // Adjust path if necessary
const { requireAuth, requireRole } = require('../middleware/auth'); // Adjust path if necessary

// All routes require basic authentication
router.use(requireAuth);

// GET all notifications (includes global is_read status)
// Accessible by any authenticated user
router.get('/', getNotifications);

// POST a new notification
// Restricted to 'dsw' and 'tusc' roles
router.post('/', requireRole('dsw', 'tusc'), createNotification);

// GET the count of globally unread notifications
// Accessible by any authenticated user (for the bell icon)
router.get('/unread-count', getUnreadNotificationCount);

// POST to mark ALL unread notifications as globally read
// Restricted to 'dsw' and 'tusc' roles (as this is a global system action)
router.post('/mark-all-as-read', requireRole('dsw', 'tusc'), markAllNotificationsAsRead);

// DELETE a specific notification by its ID
// Restricted to 'dsw' and 'tusc' roles
router.delete('/:notificationId', requireRole('dsw', 'tusc'), deleteNotification);

module.exports = router;