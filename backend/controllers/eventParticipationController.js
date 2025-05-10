const db = require('../config/db');


// Register participation (individual or team)
const registerParticipation = async (req, res) => {
  try {
    const { user_id, team_id, event_name, position, score } = req.body;

    // Debug logs
    console.log("Received participation request:", req.body);

    if (!event_name) {
      return res.status(400).send({ success: false, message: 'Event name is required' });
    }

    const [eventData] = await db.query('SELECT id FROM events WHERE name = ?', [event_name]);

    if (eventData.length === 0) {
      return res.status(404).send({ success: false, message: 'Event not found' });
    }

    const event_id = eventData[0].id;

    if (team_id && user_id) {
      return res.status(400).send({ success: false, message: 'Cannot provide both user_id and team_id for the same participation' });
    }

    if (!team_id && !user_id) {
      return res.status(400).send({ success: false, message: 'Either user_id or team_id must be provided' });
    }

    let hostel_id = null;

    if (user_id) {
      const [userData] = await db.query('SELECT hostel_id FROM users WHERE id = ?', [user_id]);

      if (userData.length === 0) {
        return res.status(404).send({ success: false, message: 'User not found' });
      }

      hostel_id = userData[0].hostel_id || 1;

      // Check if the user has already participated
      const [existingParticipation] = await db.query(
        'SELECT * FROM event_participation WHERE event_id = ? AND user_id = ?',
        [event_id, user_id]
      );

      if (existingParticipation.length > 0) {
        return res.status(400).send({
          success: false,
          message: 'User has already registered for this event',
        });
      }
    }

    if (team_id) {
      // Optional: Check if team exists and avoid duplicate team participation
      const [existingTeam] = await db.query(
        'SELECT * FROM event_participation WHERE event_id = ? AND team_id = ?',
        [event_id, team_id]
      );

      if (existingTeam.length > 0) {
        return res.status(400).send({
          success: false,
          message: 'Team has already registered for this event',
        });
      }
    }

    const [result] = await db.query(
      'INSERT INTO event_participation (event_id, hostel_id, user_id, team_id, position, score) VALUES (?, ?, ?, ?, ?, ?)',
      [event_id, hostel_id, user_id || null, team_id || null, position, score]
    );

    res.status(201).send({
      success: true,
      message: 'Participation registered successfully',
      participationId: result.insertId,
    });
  } catch (error) {
    console.error("Error in registerParticipation:", error);
    res.status(500).send({ success: false, message: 'Error registering participation', error: error.message });
  }
};

// Get all participations (with team or user details)
const getParticipations = async (req, res) => {
  try {
    const { event_id, user_id } = req.query; // Extract filters from query parameters
    let query = `SELECT ep.*, u.name AS user_name, t.name AS team_name, e.name AS event_name
                 FROM event_participation ep
                 LEFT JOIN users u ON ep.user_id = u.id
                 LEFT JOIN teams t ON ep.team_id = t.id
                 LEFT JOIN events e ON ep.event_id = e.id
                 WHERE 1`; // Default condition to avoid SQL errors

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

    res.status(200).send({ success: true, totalParticipations: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching participations', error: error.message });
  }
};

// Update participation (e.g., score, position)
const updateParticipation = async (req, res) => {
  try {
    const participationId = req.params.id;
    const { position, score } = req.body;

    const [result] = await db.query('UPDATE event_participation SET position = ?, score = ? WHERE id = ?', [position, score, participationId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Participation not found' });
    }

    res.status(200).send({ success: true, message: 'Participation updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error updating participation', error: error.message });
  }
};

// Delete participation
const deleteParticipation = async (req, res) => {
  try {
    const participationId = req.params.id;
    const [result] = await db.query('DELETE FROM event_participation WHERE id = ?', [participationId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Participation not found' });
    }

    res.status(200).send({ success: true, message: 'Participation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error deleting participation', error: error.message });
  }
};

const getParticipantsWithNames = async (req, res) => {
  try {
    const { event_id } = req.params; // Extract event_id from params
    console.log("Incoming request for event_id:", event_id);

    // Basic query with the required joins
    let query = `SELECT ep.id, ep.event_id, ep.user_id, u.name AS user_name, ep.position
                 FROM event_participation ep
                 LEFT JOIN users u ON ep.user_id = u.id
                 WHERE ep.event_id = ?`;

    const params = [event_id]; // The event_id is mandatory, so we pass it directly

    // Execute the query
    const [data] = await db.query(query, params);

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: "No participants found for this event" });
    }

    // Send the response with participant data
    res.status(200).json({
      success: true,
      totalParticipations: data.length,
      data: data.map((item) => ({
        user_id: item.user_id,
        user_name: item.user_name,
        position: item.position
      }))
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).send({ success: false, message: 'Error fetching participants', error: error.message });
  }
};

module.exports = {
  registerParticipation,
  getParticipations,
  updateParticipation,
  deleteParticipation,
  getParticipantsWithNames,
};
