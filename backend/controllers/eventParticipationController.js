const db = require('../config/db');

// Register participation (individual or team)
const registerParticipation = async (req, res) => {
  try {
    const {  team_id, event_name, position, score } = req.body;
    const { id: user_id, role } = req.user;

    if (!event_name) {
      return res.status(400).json({ success: false, message: 'Event name is required' });
    }

    if (user_id && team_id) {
      return res.status(400).json({ success: false, message: 'Provide either user_id or team_id, not both' });
    }

    if (!user_id && !team_id) {
      return res.status(400).json({ success: false, message: 'Either user_id or team_id must be provided' });
    }

    // Get event ID
    const [eventResult] = await db.query('SELECT id FROM events WHERE name = ?', [event_name]);
    if (eventResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const event_id = eventResult[0].id;

    let hostel_id = null;

    if (user_id) {
      // Get user hostel and role
      const [userResult] = await db.query('SELECT hostel_id, role FROM users WHERE id = ?', [user_id]);
      if (userResult.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { hostel_id: userHostel, role } = userResult[0];

      // Allow only student or tusc roles
      if (role !== 'student' && role !== 'tusc'&& role!=='hostel_admin'&& role !=='dsw') {
        return res.status(403).json({ success: false, message: 'Only students or TUSC members can register for events' });
      }

      hostel_id = userHostel || 1;

      // Check if already registered
      const [existingUser] = await db.query(
        'SELECT id FROM event_participation WHERE event_id = ? AND user_id = ?',
        [event_id, user_id]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({ success: false, message: 'User already registered for this event' });
      }
    }

    if (team_id) {
      const [teamResult] = await db.query('SELECT hostel_id FROM teams WHERE id = ?', [team_id]);
      if (teamResult.length === 0) {
        return res.status(404).json({ success: false, message: 'Team not found' });
      }

      hostel_id = teamResult[0].hostel_id || 1;

      // Check if team already registered
      const [existingTeam] = await db.query(
        'SELECT id FROM event_participation WHERE event_id = ? AND team_id = ?',
        [event_id, team_id]
      );
      if (existingTeam.length > 0) {
        return res.status(400).json({ success: false, message: 'Team already registered for this event' });
      }
    }

    // Insert participation
    const [insertResult] = await db.query(
      'INSERT INTO event_participation (event_id, hostel_id, user_id, team_id, position, score) VALUES (?, ?, ?, ?, ?, ?)',
      [event_id, hostel_id, user_id || null, team_id || null, position, score]
    );

    res.status(201).json({
      success: true,
      message: 'Participation registered successfully',
      participationId: insertResult.insertId
    });

  } catch (error) {
    console.error("Error in registerParticipation:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get all participations (with team or user details)
const getParticipations = async (req, res) => {
  try {
    const { event_id, user_id } = req.query;

    let query = `
      SELECT ep.*, u.name AS user_name, t.name AS team_name, e.name AS event_name
      FROM event_participation ep
      LEFT JOIN users u ON ep.user_id = u.id
      LEFT JOIN teams t ON ep.team_id = t.id
      LEFT JOIN events e ON ep.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (event_id) {
      query += " AND ep.event_id = ?";
      params.push(event_id);
    }

    if (user_id) {
      query += " AND ep.user_id = ?";
      params.push(user_id);
    }

    const [data] = await db.query(query, params);

    res.status(200).json({
      success: true,
      totalParticipations: data.length,
      data
    });
  } catch (error) {
    console.error("Error in getParticipations:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update participation (e.g., score, position)
const updateParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, score } = req.body;

    const [result] = await db.query(
      'UPDATE event_participation SET position = ?, score = ? WHERE id = ?',
      [position, score, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Participation not found' });
    }

    res.status(200).json({ success: true, message: 'Participation updated successfully' });

  } catch (error) {
    console.error("Error in updateParticipation:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Delete participation
const deleteParticipation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM event_participation WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Participation not found' });
    }

    res.status(200).json({ success: true, message: 'Participation deleted successfully' });

  } catch (error) {
    console.error("Error in deleteParticipation:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get participants for an event with names
const getParticipantsWithNames = async (req, res) => {
  try {
    const { event_id } = req.params;

    const [data] = await db.query(`
      SELECT ep.id, ep.event_id, ep.user_id, ep.team_id, ep.position, 
             u.name AS user_name, t.name AS team_name
      FROM event_participation ep
      LEFT JOIN users u ON ep.user_id = u.id
      LEFT JOIN teams t ON ep.team_id = t.id
      WHERE ep.event_id = ?
    `, [event_id]);

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: "No participants found for this event" });
    }

    res.status(200).json({
      success: true,
      totalParticipations: data.length,
      data: data.map((item) => ({
        user_id: item.user_id,
        user_name: item.user_name || null,
        team_id: item.team_id,
        team_name: item.team_name || null,
        position: item.position
      }))
    });

  } catch (error) {
    console.error("Error in getParticipantsWithNames:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Get submitted results for an event (only individual participants)
const getSubmittedResults = async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const [results] = await db.query(`
      SELECT 
        ep.score,
        ep.position,
        u.name AS user_name,
        h.name AS hostel_name
      FROM event_participation ep
      INNER JOIN users u ON ep.user_id = u.id
      LEFT JOIN hostels h ON u.hostel_id = h.id
      WHERE ep.event_id = ? AND ep.user_id IS NOT NULL
    `, [event_id]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No individual results found for this event' });
    }

    res.status(200).json({
      success: true,
      totalResults: results.length,
      data: results
    });

  } catch (error) {
    console.error("Error in getSubmittedResults:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};


const registerParticipationByAdmin = async (req, res) => {
  try {
    const { user_id, team_id, event_name, position, score } = req.body;
    const { role } = req.user;

    if (!event_name) {
      return res.status(400).json({ success: false, message: 'Event name is required' });
    }

    if (user_id && team_id) {
      return res.status(400).json({ success: false, message: 'Provide either user_id or team_id, not both' });
    }

    if (!user_id && !team_id) {
      return res.status(400).json({ success: false, message: 'Either user_id or team_id must be provided' });
    }

    // Get event ID
    const [eventResult] = await db.query('SELECT id FROM events WHERE name = ?', [event_name]);
    if (eventResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const event_id = eventResult[0].id;

    let hostel_id = null;

    if (user_id) {
      const [userResult] = await db.query('SELECT hostel_id, role FROM users WHERE id = ?', [user_id]);
      if (userResult.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { hostel_id: userHostel, role: participantRole } = userResult[0];

      // Only allow students to be registered
      if (participantRole !== 'student') {
        return res.status(400).json({ success: false, message: 'Only students can be registered as individual participants' });
      }

      hostel_id = userHostel || 1;

      // Check if already registered
      const [existingUser] = await db.query(
        'SELECT id FROM event_participation WHERE event_id = ? AND user_id = ?',
        [event_id, user_id]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({ success: false, message: 'User already registered for this event' });
      }
    }

    if (team_id) {
      const [teamResult] = await db.query('SELECT hostel_id FROM teams WHERE id = ?', [team_id]);
      if (teamResult.length === 0) {
        return res.status(404).json({ success: false, message: 'Team not found' });
      }

      hostel_id = teamResult[0].hostel_id || 1;

      // Check if team already registered
      const [existingTeam] = await db.query(
        'SELECT id FROM event_participation WHERE event_id = ? AND team_id = ?',
        [event_id, team_id]
      );
      if (existingTeam.length > 0) {
        return res.status(400).json({ success: false, message: 'Team already registered for this event' });
      }
    }

    // Insert participation
    const [insertResult] = await db.query(
      'INSERT INTO event_participation (event_id, hostel_id, user_id, team_id, position, score) VALUES (?, ?, ?, ?, ?, ?)',
      [event_id, hostel_id, user_id || null, team_id || null, position, score]
    );

    res.status(201).json({
      success: true,
      message: 'Participation registered successfully',
      participationId: insertResult.insertId
    });

  } catch (error) {
    console.error("Error in registerParticipation:", error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};



module.exports = {
  registerParticipation,
  getParticipations,
  updateParticipation,
  deleteParticipation,
  getParticipantsWithNames,
  getSubmittedResults,
  registerParticipationByAdmin,
};
