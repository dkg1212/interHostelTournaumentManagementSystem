const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  getApprovedEvents,
  registerParticipation,
  getEventResults,
  updateEventScores,
  verifyEventResult

} = require('../controllers/eventController');

const { requireAuth, requireRole } = require('../middleware/auth');

// CREATE an event (only DSW and TUSC can create events)
router.post('/events', requireAuth, requireRole('dsw', 'tusc'), createEvent);

// READ all events (any authenticated user can view)
router.get('/events', requireAuth, getEvents);

// READ a single event by ID
router.get('/events/:id', requireAuth, getEventById);

// UPDATE an event (only DSW and TUSC can update)
router.put('/events/:id', requireAuth, requireRole('dsw', 'tusc'), updateEvent);

// DELETE an event (only DSW and TUSC can delete)
router.delete('/events/:id', requireAuth, requireRole('dsw', 'tusc'), deleteEvent);

// APPROVE an event (only DSW and TUSC)
router.post('/events/approve', requireAuth, requireRole('dsw', 'tusc'), approveEvent);

// REJECT an event (optional - only DSW and TUSC)
router.post('/events/reject', requireAuth, requireRole('dsw', 'tusc'), rejectEvent);
router.get('/approved', getApprovedEvents)
// REGISTER participation (only logged-in users)
router.post('/event/register', requireAuth, registerParticipation);
router.get("/eventResults/:eventId", getEventResults);

router.put('/eventResults/:eventId/update',updateEventScores);

// Verify result
router.put('/events/:id/verify-result', verifyEventResult);


module.exports = router;
