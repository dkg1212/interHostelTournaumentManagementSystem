const db = require('../config/db');
const { updateEventScore } = require('./eventScoresController');

// Create an event (only DSW and TUSC can create events)
const createEvent = async (req, res) => {
  try {
    const { name, description, event_date, event_mode, type } = req.body;

    // Validate required fields
    if (!name || !description || !event_date || !event_mode || !type) {
      return res.status(400).send({ success: false, message: 'All fields are required' });
    }

    // Validate event_mode (should be 'team' or 'solo')
    if (!['team', 'solo'].includes(event_mode)) {
      return res.status(400).send({ success: false, message: 'Invalid event mode. It should be "team" or "solo".' });
    }

    // Validate type (should be 'sports' or 'cultural')
    if (!['sports', 'cultural'].includes(type)) {
      return res.status(400).send({ success: false, message: 'Invalid event type. It should be "sports" or "cultural".' });
    }

    // Authorization check for role (TUSC/DSW)
    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to create an event' });
    }

    // Insert new event into the database
    const [result] = await db.query(
      'INSERT INTO events (name, description, event_date, event_mode, type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, event_date, event_mode, type, req.user.id]
    );

    res.status(201).send({
      success: true,
      message: 'Event created successfully',
      eventId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error creating event', error: error.message });
  }
};


// Get all events (any user)
const getEvents = async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM events');
    res.status(200).send({ success: true, totalEvents: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching events', error: error.message });
  }
};

// Get an event by ID (any user)
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const [data] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);

    if (data.length === 0) {
      return res.status(404).send({ success: false, message: 'Event not found' });
    }

    res.status(200).send({ success: true, event: data[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching event', error: error.message });
  }
};

// Update event (DSW or TUSC)
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, description, event_date } = req.body;

    if (!name || !description || !event_date) {
      return res.status(400).send({ success: false, message: 'All fields are required' });
    }

    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to update this event' });
    }

    await db.query(
      'UPDATE events SET name = ?, description = ?, event_date = ? WHERE id = ?',
      [name, description, event_date, eventId]
    );

    res.status(200).send({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error updating event', error: error.message });
  }
};

// Delete event (DSW or TUSC)
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to delete this event' });
    }

    const [result] = await db.query('DELETE FROM events WHERE id = ?', [eventId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Event not found' });
    }

    res.status(200).send({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error deleting event', error: error.message });
  }
};

// Approve event (TUSC or DSW)
const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to approve this event' });
    }

    const column = req.user.role === 'tusc' ? 'tusc_approved' : 'dsw_approved';
    const [result] = await db.query(`UPDATE events SET ${column} = TRUE WHERE id = ?`, [eventId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Event not found' });
    }

    res.status(200).send({ success: true, message: `Event approved by ${req.user.role.toUpperCase()}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error approving event', error: error.message });
  }
};

// Reject event (Optional - to reset approvals)
const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to reject this event' });
    }

    const column = req.user.role === 'tusc' ? 'tusc_approved' : 'dsw_approved';
    const [result] = await db.query(`UPDATE events SET ${column} = FALSE WHERE id = ?`, [eventId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Event not found' });
    }

    res.status(200).send({ success: true, message: `Event rejected by ${req.user.role.toUpperCase()}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error rejecting event', error: error.message });
  }
};

const getApprovedEvents = async (req, res) => {
  try {
    const userId = req.user?.id;

    const [events] = await db.query(
      `SELECT * FROM events WHERE tusc_approved = true AND dsw_approved = true`
    );

    // If user is logged in, check registration
    if (userId) {
      const eventsWithRegistration = await Promise.all(events.map(async (event) => {
        const [registration] = await db.query(
          `SELECT id FROM event_participation WHERE event_id = ? AND user_id = ?`,
          [event.id, userId]
        );
        return { ...event, isRegistered: registration.length > 0 };
      }));

      return res.status(200).json({
        success: true,
        message: 'Fetched approved events with registration status',
        events: eventsWithRegistration,
      });
    }

    // If no user logged in, just return events
    res.status(200).json({
      success: true,
      message: 'Fetched approved events',
      events,
    });
  } catch (error) {
    console.error("Error fetching approved events:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//By user
const registerParticipation = async (req, res) => {
  try {
    const { event_id } = req.body;
    const { id: user_id, hostel_id } = req.user; // hostel_id must be available in the token

    if (!event_id) {
      return res.status(400).json({ success: false, message: "Event ID is required" });
    }

    // Now include hostel_id in the insert
    await pool.query(
      "INSERT INTO event_participation (event_id, user_id, hostel_id) VALUES (?, ?, ?)",
      [event_id, user_id, hostel_id]
    );

    res.status(201).json({ success: true, message: "Successfully registered for the event" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getEventResults = async (req, res) => {
  const { eventId } = req.params;

  try {
    const [participants] = await db.query(
      `
      SELECT ep.user_id, u.name AS user_name, ep.score
      FROM event_participation ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.event_id = ?
      ORDER BY ep.score DESC
      `,
      [eventId]
    );

    const resultsWithPosition = participants.map((participant, index) => ({
      ...participant,
      position: index + 1, // 1st, 2nd, 3rd, etc.
    }));

    res.status(200).json({
      success: true,
      message: "Event results fetched successfully",
      results: resultsWithPosition,
    });
  } catch (error) {
    console.error("Error fetching event results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event results",
      error: error.message,
    });
  }
};

// Update event scores
const updateEventScores = async (req, res) => {
const { eventId } = req.params;
  const { user_id, score } = req.body;

  if (!user_id || score === undefined) {
    return res.status(400).json({
      success: false,
      message: "Both user_id and score are required.",
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE event_participation SET score = ? WHERE event_id = ? AND user_id = ?`,
      [score, eventId, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching participant found to update.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Score updated successfully.",
    });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
// Verify event result (TUSC or DSW)
const verifyEventResult = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to verify results",
    });
  }

  const column =
    req.user.role === 'dsw'
      ? 'result_verified_by_dsw'
      : 'result_verified_by_tusc';

  try {
    const [result] = await db.query(
      `UPDATE events SET ${column} = true WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Event result verified by ${req.user.role.toUpperCase()}`,
    });
  } catch (error) {
    console.error("Error verifying result:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  getApprovedEvents,
  registerParticipation,
  getEventResults,
  updateEventScores,
  verifyEventResult
};
