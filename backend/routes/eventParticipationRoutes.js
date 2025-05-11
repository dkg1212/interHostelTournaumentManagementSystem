const express = require('express');
const router = express.Router();
const {
  registerParticipation,
  getParticipations,
  updateParticipation,
  deleteParticipation,
  getParticipantsWithNames ,
  getSubmittedResults      // Cancel participation
} = require('../controllers/eventParticipationController');
const { requireAuth, requireRole } = require('../middleware/auth');




// All routes protected
router.use(requireAuth);

// GET all participations (with team and user details)
router.get('/participations', getParticipations);

// POST create new participation (TUSC, DSW, hostel_admin)
router.post('/participations', requireRole('dsw', 'tusc', 'hostel_admin'), registerParticipation);

// PUT update position or score
router.put('/participations/:id', requireRole('dsw', 'tusc'), updateParticipation);

// DELETE participation (e.g., cancel)
router.delete('/participations/:id', requireRole('dsw', 'tusc'), deleteParticipation);

router.get('/participations/:event_id', requireRole('dsw', 'tusc'), getParticipantsWithNames);
router.get('/submitted-results/:event_id', getSubmittedResults);

module.exports = router;
