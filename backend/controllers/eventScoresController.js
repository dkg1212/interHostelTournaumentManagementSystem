const db = require('../config/db');

// Get all event scores with user/team names, hostel names, and event names
const getAllEventScores = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT es.id, es.score, es.remarks, 
              e.name AS event_name, 
              h.name AS hostel_name, 
              u.name AS user_name, 
              t.name AS team_name
       FROM event_scores es
       LEFT JOIN events e ON es.event_id = e.id
       LEFT JOIN hostels h ON es.hostel_id = h.id
       LEFT JOIN users u ON es.user_id = u.id
       LEFT JOIN teams t ON es.team_id = t.id`
    );

    res.status(200).send({ success: true, totalScores: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching event scores', error: error.message });
  }
};

// Create a new event score
const createEventScore = async (req, res) => {
  try {
    const { event_id, hostel_id, user_id, team_id, score, remarks } = req.body;

    // Insert event score into the database
    const [result] = await db.query(
      'INSERT INTO event_scores (event_id, hostel_id, user_id, team_id, score, remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [event_id, hostel_id, user_id || null, team_id || null, score, remarks]
    );

    res.status(201).send({
      success: true,
      message: 'Event score registered successfully',
      scoreId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error registering event score', error: error.message });
  }
};

// Update an existing event score
const updateEventScore = async (req, res) => {
  try {
    const scoreId = req.params.id;
    const { score, remarks } = req.body;

    await db.query('UPDATE event_scores SET score = ?, remarks = ? WHERE id = ?', [score, remarks, scoreId]);

    res.status(200).send({ success: true, message: 'Event score updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error updating event score', error: error.message });
  }
};

// Delete an event score
const deleteEventScore = async (req, res) => {
  try {
    const scoreId = req.params.id;
    const [result] = await db.query('DELETE FROM event_scores WHERE id = ?', [scoreId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Event score not found' });
    }

    res.status(200).send({ success: true, message: 'Event score deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error deleting event score', error: error.message });
  }
};

module.exports = {
  getAllEventScores,
  createEventScore,
  updateEventScore,
  deleteEventScore,
};
