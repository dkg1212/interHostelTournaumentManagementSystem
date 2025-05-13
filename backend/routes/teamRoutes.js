const express = require('express');
const router = express.Router();

const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getTeamMembers,
  removeTeamMember
  
} = require('../controllers/teamController');
const { requireAuth, requireRole } = require('../middleware/auth');

// CREATE a new team (only Hostel Admin and DSW can create teams)
router.post('/', requireAuth, requireRole('hostel_admin', 'dsw'), createTeam);

// READ all teams (any authenticated user can view)
router.get('/', requireAuth, getAllTeams);

// READ a team by ID (any authenticated user can view)
router.get('/:id', requireAuth, getTeamById);

// UPDATE a team (only Hostel Admin and DSW can update teams)
router.put('/:id', requireAuth, requireRole('hostel_admin', 'dsw'), updateTeam);

// DELETE a team (only Hostel Admin and DSW can delete teams)
router.delete('/:id', requireAuth, requireRole('hostel_admin', 'dsw'), deleteTeam);

router.post('/add-member', requireAuth, addTeamMember);

router.get('/:team_id/member', requireAuth, getTeamMembers);
router.delete('/remove-member/:team_id/:student_id', requireAuth, removeTeamMember);
module.exports = router;
