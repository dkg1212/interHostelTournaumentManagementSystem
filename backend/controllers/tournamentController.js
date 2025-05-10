const db = require('../config/db');

// Create a tournament (only DSW and TUSC can create tournaments)
const createTournament = async (req, res) => {
  try {
    const { name, description, tournament_date } = req.body;

    if (!name || !description || !tournament_date) {
      return res.status(400).send({ success: false, message: 'All fields are required' });
    }

    const [result] = await db.query('INSERT INTO tournaments (name, description, tournament_date) VALUES (?, ?, ?)', [name, description, tournament_date]);

    res.status(201).send({
      success: true,
      message: 'Tournament created successfully',
      tournamentId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error creating tournament', error: error.message });
  }
};

// Get all tournaments (any user can view tournaments)
const getTournaments = async (req, res) => {
  try {
    const [data] = await db.query('SELECT * FROM tournaments');
    res.status(200).send({ success: true, totalTournaments: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching tournaments', error: error.message });
  }
};

// Get tournament by ID (any user can view tournaments)
const getTournamentById = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const [data] = await db.query('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);

    if (data.length === 0) {
      return res.status(404).send({ success: false, message: 'Tournament not found' });
    }

    res.status(200).send({ success: true, tournament: data[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching tournament', error: error.message });
  }
};

// Update tournament (only DSW and TUSC can update tournaments)
const updateTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const { name, description, tournament_date } = req.body;

    if (!name || !description || !tournament_date) {
      return res.status(400).send({ success: false, message: 'Name, description, and tournament date are required' });
    }

    await db.query('UPDATE tournaments SET name = ?, description = ?, tournament_date = ? WHERE id = ?', [name, description, tournament_date, tournamentId]);

    res.status(200).send({ success: true, message: 'Tournament updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error updating tournament', error: error.message });
  }
};

// Delete tournament (only DSW and TUSC can delete tournaments)
const deleteTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const [result] = await db.query('DELETE FROM tournaments WHERE id = ?', [tournamentId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Tournament not found' });
    }

    res.status(200).send({ success: true, message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error deleting tournament', error: error.message });
  }
};

module.exports = {
  createTournament,
  getTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
};
