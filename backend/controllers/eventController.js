const db = require('../config/db');

// Create an event (only DSW and TUSC can create events)
const createEvent = async (req, res) => {
  try {
    const { name, description, event_date } = req.body;

    if (!name || !description || !event_date) {
      return res.status(400).send({ success: false, message: 'All fields are required' });
    }

    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to create an event' });
    }

    const [result] = await db.query(
      'INSERT INTO events (name, description, event_date, created_by) VALUES (?, ?, ?, ?)',
      [name, description, event_date, req.user.id]
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

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
};
