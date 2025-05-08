const express = require('express');
const router = express.Router();
const {
  getAllEventScores,
  createEventScore,
  updateEventScore,
  deleteEventScore,
} = require('../controllers/eventScoresController');
const { requireAuth, requireRole } = require('../middleware/auth');

// All routes protected
router.use(requireAuth);

// GET all event scores
router.get('/', getAllEventScores);

// POST create a new event score (TUSC, DSW, hostel_admin)
router.post('/', requireRole('dsw', 'tusc', 'hostel_admin'), createEventScore);

// PUT update an event score
router.put('/:id', requireRole('dsw', 'tusc'), updateEventScore);

// DELETE an event score
router.delete('/:id', requireRole('dsw', 'tusc'), deleteEventScore);

module.exports = router;
