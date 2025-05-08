const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications
} = require('../controllers/notificationController');
const { requireAuth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// GET all notifications (public to all roles)
router.get('/', getNotifications);

// POST notification (only by dsw and tusc)
router.post('/', requireRole('dsw', 'tusc'), createNotification);

module.exports = router;
