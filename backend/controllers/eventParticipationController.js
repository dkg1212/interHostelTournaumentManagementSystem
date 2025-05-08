const db = require('../config/db');

// Register participation (individual or team)
const registerParticipation = async (req, res) => {
    try {
      const { user_id, team_id, event_name, position, score } = req.body;
  
      // Check if the event is provided (either by ID or name)
      if (!event_name) {
        return res.status(400).send({ success: false, message: 'Event name is required' });
      }
  
      // Fetch the event_id based on the event name (or ID if passed)
      const [eventData] = await db.query('SELECT id FROM events WHERE name = ?', [event_name]);
      
      if (eventData.length === 0) {
        return res.status(404).send({ success: false, message: 'Event not found' });
      }
      
      const event_id = eventData[0].id;
  
      // Get the user's hostel_id
      const [userData] = await db.query('SELECT hostel_id FROM users WHERE id = ?', [user_id]);
  
      if (userData.length === 0) {
        return res.status(404).send({ success: false, message: 'User not found' });
      }
  
      const hostel_id = userData[0].hostel_id || 1;  // Default to hostel_id 1 if no hostel is linked
  
      // If team-based event, validate team_id and user_id are not both provided
      if (team_id && user_id) {
        return res.status(400).send({ success: false, message: 'Cannot provide both user_id and team_id for the same participation' });
      }
  
      // If individual event, ensure user_id is provided, and team_id is null
      if (!team_id && !user_id) {
        return res.status(400).send({ success: false, message: 'Either user_id or team_id must be provided' });
      }
  
      // Insert participation (correct query with hostel_id)
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
      console.error(error);
      res.status(500).send({ success: false, message: 'Error registering participation', error: error.message });
    }
  };
  
// Get all participations (with team or user details)
const getParticipations = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT ep.*, u.name AS user_name, t.name AS team_name
       FROM event_participation ep
       LEFT JOIN users u ON ep.user_id = u.id
       LEFT JOIN teams t ON ep.team_id = t.id`
    );

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

module.exports = {
  registerParticipation,
  getParticipations,
  updateParticipation,
  deleteParticipation,
};
