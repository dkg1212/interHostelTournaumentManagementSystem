/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout'; // ✅ Layout wrapper

const POSITION_OPTIONS = [
  '1st',
  '2nd',
  '3rd',
  'participant',
  'Honorable Mention',
  'Disqualified',
];

const Participants = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [form, setForm] = useState({
    event_name: '',
    user_id: '',
    position: 'participant',
    score: 0,
  });

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ position: '', score: '' });

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: '/api',
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [evRes, usRes, ptRes] = await Promise.all([
          api.get('/events'),
          api.get('/users'),
          api.get('/participations'),
        ]);
        setEvents(evRes.data.data || []);
        setUsers(usRes.data.data || []);
        setParticipants(ptRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadAll();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await api.get('/participations');
      setParticipants(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/participations', form);
      setForm({ event_name: '', user_id: '', position: 'participant', score: 0 });
      fetchParticipants();
    } catch (err) {
      console.error('Registration failed', err);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditValues({ position: p.position, score: p.score });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ position: '', score: '' });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/participations/${id}`, editValues);
      setEditingId(null);
      fetchParticipants();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/participations/${id}`);
      fetchParticipants();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <Layout>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Event Participations</h1>
      </header>

      {/* Registration Form */}
      <form
        onSubmit={handleRegister}
        className="mb-8 bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium">Event</label>
          <select
            value={form.event_name}
            onChange={e => setForm({ ...form, event_name: e.target.value })}
            className="border p-2 w-full rounded"
            required
          >
            <option value="" disabled>Select an event…</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.name}>
                {ev.name} — {new Date(ev.event_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Participant</label>
          <select
            value={form.user_id}
            onChange={e => setForm({ ...form, user_id: e.target.value })}
            className="border p-2 w-full rounded"
            required
          >
            <option value="" disabled>Select a user…</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Position</label>
          <select
            value={form.position}
            onChange={e => setForm({ ...form, position: e.target.value })}
            className="border p-2 w-full rounded"
          >
            {POSITION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Score</label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.score}
            onChange={e => setForm({ ...form, score: Math.min(100, Number(e.target.value)) })}
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          Register
        </button>
      </form>

      {/* Participations Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Event</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Team</th>
              <th className="border px-4 py-2">Position</th>
              <th className="border px-4 py-2">Score</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.length > 0 ? (
              participants.map(p => (
                <tr key={p.id}>
                  <td className="border px-4 py-2">{p.id}</td>
                  <td className="border px-4 py-2">{p.event_name}</td>
                  <td className="border px-4 py-2">{p.user_name || '—'}</td>
                  <td className="border px-4 py-2">{p.team_name || '—'}</td>
                  <td className="border px-4 py-2">
                    {editingId === p.id ? (
                      <select
                        value={editValues.position}
                        onChange={e => setEditValues(v => ({ ...v, position: e.target.value }))}
                        className="border p-1 w-full rounded"
                      >
                        {POSITION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      p.position
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editValues.score}
                        onChange={e => setEditValues(v => ({ ...v, score: Math.min(100, Number(e.target.value)) }))}
                        className="border p-1 w-20 rounded"
                      />
                    ) : (
                      p.score
                    )}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    {editingId === p.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(p.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="border px-4 py-2 text-center text-gray-500">
                  No participations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Participants;
