const express = require('express');
const router = express.Router();
const {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
} = require('../controllers/tournamentController');
const { requireAuth, requireRole } = require('../middleware/auth');

// CREATE a new tournament (only DSW and TUSC can create tournaments)
router.post('/tournaments', requireAuth, requireRole('dsw', 'tusc'), createTournament);

// READ all tournaments (any authenticated user can view)
router.get('/tournaments', requireAuth, getTournaments);

// READ a tournament by ID (any authenticated user can view)
router.get('/tournaments/:id', requireAuth, getTournamentById);

// UPDATE a tournament (only DSW and TUSC can update tournaments)
router.put('/tournaments/:id', requireAuth, requireRole('dsw', 'tusc'), updateTournament);

// DELETE a tournament (only DSW and TUSC can delete tournaments)
router.delete('/tournaments/:id', requireAuth, requireRole('dsw', 'tusc'), deleteTournament);

module.exports = router;
