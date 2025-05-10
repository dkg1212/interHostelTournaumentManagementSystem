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

// Get event scores for review (with approval statuses)
const getEventScoresWithApprovals = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT 
        es.id AS score_id,
        es.score,
        es.remarks,
        e.id AS event_id,
        e.name AS event_name,
        e.tusc_approved,
        e.dsw_approved,
        e.final_approved,
        h.name AS hostel_name,
        u.name AS user_name,
        t.name AS team_name
      FROM event_scores es
      LEFT JOIN events e ON es.event_id = e.id
      LEFT JOIN hostels h ON es.hostel_id = h.id
      LEFT JOIN users u ON es.user_id = u.id
      LEFT JOIN teams t ON es.team_id = t.id
    `);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching review data', error: error.message });
  }
};

// Create a new event score
const createEventScore = async (req, res) => {
  try {
    const { event_id, hostel_id, user_id, team_id, score, remarks } = req.body;

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

// ✅ Get a single event score by ID with joined names
const getEventScoreById = async (req, res) => {
  try {
    const scoreId = req.params.id;

    const [rows] = await db.query(
      `SELECT es.id, es.event_id, es.hostel_id, es.user_id, es.team_id, es.score, es.remarks,
              e.name AS event_name,
              h.name AS hostel_name,
              u.name AS user_name,
              t.name AS team_name
       FROM event_scores es
       LEFT JOIN events e ON es.event_id = e.id
       LEFT JOIN hostels h ON es.hostel_id = h.id
       LEFT JOIN users u ON es.user_id = u.id
       LEFT JOIN teams t ON es.team_id = t.id
       WHERE es.id = ?`,
      [scoreId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event score not found' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching event score by ID:', error);
    res.status(500).json({ success: false, message: 'Error fetching event score', error: error.message });
  }
};

// (Optional) Get event score by names instead of IDs
const getEventScoreByNames = async (req, res) => {
  try {
    const { eventName, hostelName, userName, teamName } = req.params;

    const [rows] = await db.query(
      `SELECT es.id, es.event_id, es.hostel_id, es.user_id, es.team_id, es.score, es.remarks,
              e.name AS event_name,
              h.name AS hostel_name,
              u.name AS user_name,
              t.name AS team_name
       FROM event_scores es
       LEFT JOIN events e ON es.event_id = e.id
       LEFT JOIN hostels h ON es.hostel_id = h.id
       LEFT JOIN users u ON es.user_id = u.id
       LEFT JOIN teams t ON es.team_id = t.id
       WHERE e.name = ? AND h.name = ? AND (u.name = ? OR t.name = ?)`,
      [eventName, hostelName, userName || "", teamName || ""]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event score not found' });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching event score by names:', error);
    res.status(500).json({ success: false, message: 'Error fetching event score', error: error.message });
  }
};



module.exports = {
  getAllEventScores,
  createEventScore,
  updateEventScore,
  deleteEventScore,
  getEventScoresWithApprovals,
  getEventScoreById,
  getEventScoreByNames,
};
