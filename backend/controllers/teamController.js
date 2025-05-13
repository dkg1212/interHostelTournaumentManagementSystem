const db = require('../config/db'); // Your DB configuration

// Create a team
const createTeam = async (req, res) => {
  const { name, created_by } = req.body; // Get the team name and creator's user ID

  if (!name ) {
    return res.status(400).json({ message: 'Team name and creator are required' });
  }

  try {
    // Insert a new team into the 'teams' table
    const query = 'INSERT INTO teams (name, created_by) VALUES (?, ?)';
    const [result] = await db.execute(query, [name, created_by]);
    res.status(201).json({ message: 'Team created successfully', teamId: result.insertId });
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ message: 'Error creating team' });
  }
};

// Fetch all teams
const getAllTeams = async (req, res) => {
  try {
    const query = 'SELECT * FROM teams';
    const [teams] = await db.execute(query);
    res.status(200).json({ teams });
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

// Fetch a specific team by ID
const getTeamById = async (req, res) => {
  const { id } = req.params; // Team ID

  try {
    const query = 'SELECT * FROM teams WHERE id = ?';
    const [team] = await db.execute(query, [id]);

    if (team.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ team: team[0] });
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

// Update a team's details (e.g., name)
const updateTeam = async (req, res) => {
  const { id } = req.params; // Team ID
  const { name } = req.body; // New name for the team

  if (!name) {
    return res.status(400).json({ message: 'Team name is required' });
  }

  try {
    const query = 'UPDATE teams SET name = ? WHERE id = ?';
    const [result] = await db.execute(query, [name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ message: 'Team updated successfully' });
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ message: 'Error updating team' });
  }
};

// Delete a team
const deleteTeam = async (req, res) => {
  const { id } = req.params; // Team ID

  try {
    const query = 'DELETE FROM teams WHERE id = ?';
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ message: 'Error deleting team' });
  }
};

// Add a member to a team
const addTeamMember = async (req, res) => {
  const { team_id, student_id, event_type } = req.body; // team_id, student_id, event_type

  if (!team_id || !student_id || !event_type) {
    return res.status(400).json({ message: 'Team ID, Student ID, and Event Type are required.' });
  }

  try {
    // Check if the student is already a member of the team
    const checkMemberQuery = 'SELECT * FROM team_members WHERE team_id = ? AND student_id = ?';
    const [existingMember] = await db.execute(checkMemberQuery, [team_id, student_id]);

    if (existingMember.length > 0) {
      return res.status(400).json({ message: 'Student is already a member of the team.' });
    }

    // For sports events: Ensure all members of the team are from the same hostel
    if (event_type === 'sports') {
      // Get the hostel ID of the student trying to join
      const getHostelQuery = 'SELECT hostel_id FROM students WHERE id = ?';
      const [studentHostel] = await db.execute(getHostelQuery, [student_id]);

      // Check if there are any members from a different hostel already in the team
      const checkOtherHostelMembersQuery = `
        SELECT tm.*
        FROM team_members tm
        JOIN students s ON tm.student_id = s.id
        WHERE tm.team_id = ? AND s.hostel_id != ?
      `;
      const [otherHostelMembers] = await db.execute(checkOtherHostelMembersQuery, [team_id, studentHostel[0].hostel_id]);

      if (otherHostelMembers.length > 0) {
        return res.status(400).json({ message: 'All members of a sports team must be from the same hostel.' });
      }
    }

    // For cultural events: Allow members from different hostels but only one from boys' hostel and one from girls' hostel
    if (event_type === 'cultural') {
      const [boysHostelMembers] = await db.execute(`
        SELECT * FROM team_members tm
        JOIN students s ON tm.student_id = s.id
        WHERE tm.team_id = ? AND s.hostel_id IN (SELECT id FROM hostels WHERE gender = 'boys')
      `, [team_id]);

      const [girlsHostelMembers] = await db.execute(`
        SELECT * FROM team_members tm
        JOIN students s ON tm.student_id = s.id
        WHERE tm.team_id = ? AND s.hostel_id IN (SELECT id FROM hostels WHERE gender = 'girls')
      `, [team_id]);

      if (boysHostelMembers.length > 0 && girlsHostelMembers.length > 0) {
        return res.status(400).json({ message: 'Cultural event team can have users from only one boys hostel and one girls hostel.' });
      }
    }

    // Add the member to the team
    const insertMemberQuery = 'INSERT INTO team_members (team_id, student_id, event_type) VALUES (?, ?, ?)';
    await db.execute(insertMemberQuery, [team_id, student_id, event_type]);

    res.status(201).json({ message: 'Student added to the team successfully.' });
  } catch (err) {
    console.error('Error adding member to team:', err);
    res.status(500).json({ message: 'Error adding member to team.' });
  }
};



// Fetch members of a team
const getTeamMembers = async (req, res) => {
  const { team_id } = req.params;

  if (!team_id) {
    return res.status(400).json({ message: 'Missing team_id in request parameters.' });
  }

  try {
    const query = `
      SELECT tm.id, u.name AS user_name, h.name AS hostel_name, tm.event_type
      FROM team_members tm
      JOIN students s ON tm.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN hostels h ON s.hostel_id = h.id
      WHERE tm.team_id = ?
    `;
    const [members] = await db.execute(query, [team_id]);
    res.status(200).json({ members });
  } catch (err) {
    console.error('Error fetching team members:', err);
    res.status(500).json({ message: 'Error fetching team members.' });
  }
};


// Remove a member from a team
// In your controller file (e.g., teamController.js)
const removeTeamMember = async (req, res) => {

  // CHANGE HERE: Use snake_case to match req.params
  const { team_id, student_id } = req.params;

  // Now the validation uses the correct variable names
  if (!team_id || !student_id) {
    return res.status(400).json({ message: 'Team ID and Student ID are required in the URL path. Params received: ' + JSON.stringify(req.params) });
  }

  // Use these snake_case variables for parsing
  const teamIdInt = parseInt(team_id, 10);
  const studentIdInt = parseInt(student_id, 10);

  if (isNaN(teamIdInt) || isNaN(studentIdInt)) {
    return res.status(400).json({ message: 'Team ID and Student ID must be valid numbers.' });
  }

  try {
    // Use teamIdInt and studentIdInt (which were derived from team_id and student_id)
    const checkMemberQuery = 'SELECT * FROM team_members WHERE team_id = ? AND student_id = ?';
    const [existingMember] = await db.execute(checkMemberQuery, [teamIdInt, studentIdInt]);

    if (existingMember.length === 0) {
      return res.status(404).json({ message: 'Membership not found.' });
    }

    const deleteMemberQuery = 'DELETE FROM team_members WHERE team_id = ? AND student_id = ?';
    const [deleteResult] = await db.execute(deleteMemberQuery, [teamIdInt, studentIdInt]);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Could not remove member, already removed or does not exist.' });
    }

    res.status(200).json({ message: 'Student removed from the team successfully.' });
  } catch (err) {
    console.error('Error removing member from team:', err);
    res.status(500).json({ message: 'Server error while removing member.' });
  }
};


module.exports = {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
};
