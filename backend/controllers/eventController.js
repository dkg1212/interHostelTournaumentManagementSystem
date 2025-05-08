const db = require('../config/db');

// Create an event (only DSW and TUSC can create events)
const createEvent = async (req, res) => {
  try {
    const { name, description, event_date } = req.body;

    // Validate input fields
    if (!name || !description || !event_date) {
      return res.status(400).send({ success: false, message: 'All fields are required' });
    }

    // Check if user has the correct role (DSW or TUSC)
    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to create an event' });
    }

    // Insert the event with the created_by field as the logged-in user's ID
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

// Get all events (any user can view events)
const getEvents = async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM events');
    res.status(200).send({ success: true, totalEvents: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching events', error: error.message });
  }
};

// Get an event by ID (any user can view events)
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

// Update an event (only DSW and TUSC can update events)
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, description, event_date } = req.body;

    // Validate input fields
    if (!name || !description || !event_date) {
      return res.status(400).send({ success: false, message: 'Name, description, and event date are required' });
    }

    // Check if user has the correct role (DSW or TUSC)
    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to update this event' });
    }

    // Update event data in the database
    await db.query('UPDATE events SET name = ?, description = ?, event_date = ? WHERE id = ?', [
      name,
      description,
      event_date,
      eventId,
    ]);

    res.status(200).send({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error updating event', error: error.message });
  }
};

// Delete an event (only DSW and TUSC can delete events)
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Check if user has the correct role (DSW or TUSC)
    if (req.user.role !== 'dsw' && req.user.role !== 'tusc') {
      return res.status(403).send({ success: false, message: 'You are not authorized to delete this event' });
    }

    // Delete event from the database
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

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
