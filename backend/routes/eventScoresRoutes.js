const express = require('express');
const router = express.Router();
const {
  getAllEventScores,
  createEventScore,
  updateEventScore,
  deleteEventScore,
  getEventScoresWithApprovals,
  getEventScoreById,
  getEventScoreByNames,
} = require('../controllers/eventScoresController');
const { requireAuth, requireRole } = require('../middleware/auth');

// All routes protected
router.use(requireAuth);

// GET all event scores
router.get('/', getAllEventScores);
router.get('/review', requireRole('dsw', 'tusc'), getEventScoresWithApprovals);

// POST create a new event score (TUSC, DSW, hostel_admin)
router.post('/', requireRole('dsw', 'tusc', 'hostel_admin'), createEventScore);

// PUT update an event score
router.put('/:id', requireRole('dsw', 'tusc'), updateEventScore);

// DELETE an event score
router.delete('/:id', requireRole('dsw', 'tusc'), deleteEventScore);


// Add this route
router.get('/:id', requireRole('dsw', 'tusc'), getEventScoreById);

router.get('/byNames', requireRole('dsw', 'tusc'), getEventScoreByNames);

module.exports = router;
