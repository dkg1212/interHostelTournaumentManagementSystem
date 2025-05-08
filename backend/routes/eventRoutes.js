const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middleware/auth');

// CREATE an event (only DSW and TUSC can create events)
router.post('/events', requireAuth, requireRole('dsw', 'tusc'), createEvent);

// READ all events (any authenticated user can view)
router.get('/events', requireAuth, getEvents);

// READ an event by ID (any authenticated user can view)
router.get('/events/:id', requireAuth, getEventById);

// UPDATE an event (only DSW and TUSC can update events)
router.put('/events/:id', requireAuth, requireRole('dsw', 'tusc'), updateEvent);

// DELETE an event (only DSW and TUSC can delete events)
router.delete('/events/:id', requireAuth, requireRole('dsw', 'tusc'), deleteEvent);

module.exports = router;
