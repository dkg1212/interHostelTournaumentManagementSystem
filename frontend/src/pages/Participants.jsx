/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit,
  Trash2,
  Save,
  XCircle,
  PlusCircle,
  AlertTriangle,
  CheckCircle as SuccessCircle,
  Loader2,
  ListChecks,
  UserCircle2,
  CalendarDays,
  User,
  Users, // Icon for teams
  Award,
  Info,
} from 'lucide-react';
import Layout from '../components/Layout'; // Ensure this path is correct

const POSITION_OPTIONS = [
  '1st',
  '2nd',
  '3rd',
  'participant',
  'Honorable Mention',
  'Disqualified',
];

// --- Refined Animation Variants ---
const pageFadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const cardFadeInUp = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.3, ease: "easeIn" } },
};

const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  exit: {}
};
// --- End Animation Variants ---

const actionButtonClass = (color) =>
  `p-2 rounded-md text-white flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1`;

const Participants = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [form, setForm] = useState({
    event_name: '', // Changed back to event_name
    user_id: '',
    team_id: '',
    position: 'participant',
    score: 0,
  });

  const [editingId, setEditingId] = useState(null);
  // Edit values might need to align with what backend expects for update if it's different
  // For now, assuming update uses IDs where possible, but create uses name for event.
  const [editValues, setEditValues] = useState({ position: '', score: '', team_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCardActionLoading, setIsCardActionLoading] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: '/api',
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(n => ({ ...n, show: false }));
    }, duration);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [evRes, usRes, ptRes, tmRes] = await Promise.all([
          api.get('/events'),
          api.get('/users'),
          api.get('/participations'),
          api.get('/teams'),
        ]);
        setEvents(evRes.data.data || []);
        setUsers(usRes.data.data || []);
        setParticipants(ptRes.data.data || []);
        setTeams(tmRes.data.teams || []);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        let errorMsg = 'Failed to load initial data.';
        if (err.response) { errorMsg += ` Status: ${err.response.status}.`; }
        if (err.message) { errorMsg += ` Message: ${err.message}.`; }
        showNotification(`${errorMsg} Check console for details.`, 'error', 5000);
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
      showNotification('Failed to fetch participants.', 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.event_name || (!form.user_id && !form.team_id)) { // Check event_name
      showNotification('Event is required. Either Participant or Team must be selected.', 'error');
      return;
    }
    setIsSubmitting(true);

    const payload = {
      event_name: form.event_name, // Send event_name
      user_id: form.user_id ? Number(form.user_id) : null,
      team_id: form.team_id ? Number(form.team_id) : null,
      position: form.position,
      score: Number(form.score),
    };

    console.log('Submitting payload for registration:', payload);

    try {
      await api.post('/participations/byadmin', payload);
      setForm({ event_name: '', user_id: '', team_id: '', position: 'participant', score: 0 }); // Reset event_name
      fetchParticipants();
      showNotification('Participant registered successfully!', 'success');
    } catch (err) {
      console.error('Registration failed error object:', err);
      if (err.response) {
        console.error('Backend Response Data:', err.response.data);
        showNotification(err.response.data?.message || `Registration failed: ${err.response.statusText}`, 'error');
      } else {
        showNotification('Registration failed. Check console for details.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditValues({
      position: p.position,
      score: p.score,
      team_id: p.team_id || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ position: '', score: '', team_id: '' });
  };

  const saveEdit = async (id) => {
    setIsCardActionLoading(id);
    // For PUT requests, backends often expect IDs.
    // If the PUT endpoint also expects event_name, you'll need to adjust this.
    // For now, assuming PUT uses IDs for relationships where possible.
    const payload = {
      position: editValues.position,
      score: Number(editValues.score),
      team_id: editValues.team_id ? Number(editValues.team_id) : null,
      // If event needs to be updatable, and backend requires event_name for update,
      // you'd need to add a field for event_name in editValues and send it.
    };

    console.log(`Submitting payload for update (ID: ${id}):`, payload);

    try {
      await api.put(`/participations/${id}`, payload);
      setEditingId(null);
      fetchParticipants();
      showNotification('Participant updated successfully!', 'success');
    } catch (err) {
      console.error(`Update failed for ID ${id}:`, err);
      if (err.response) {
        console.error('Backend Response Data:', err.response.data);
        showNotification(err.response.data?.message || `Update failed: ${err.response.statusText}`, 'error');
      } else {
        showNotification('Update failed. Check console for details.', 'error');
      }
    } finally {
      setIsCardActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this participation?')) {
      setIsCardActionLoading(id);
      try {
        await api.delete(`/participations/${id}`);
        setParticipants(prev => prev.filter(p => p.id !== id));
        showNotification('Participant deleted successfully!', 'success');
      } catch (err) {
        console.error('Delete failed', err);
        if (err.response) {
            console.error('Backend Response Data:', err.response.data);
            showNotification(err.response.data?.message || `Delete failed: ${err.response.statusText}`, 'error');
        } else {
            showNotification('Delete failed. Check console for details.', 'error');
        }
      } finally {
        setIsCardActionLoading(null);
      }
    }
  };

  const CardDetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-2 text-sm">
      <Icon className="text-indigo-500 mt-0.5 flex-shrink-0" size={16} />
      <span className="text-gray-600"><strong className="text-gray-700">{label}:</strong> {value || '—'}</span>
    </div>
  );

  const isRegisterButtonDisabled = isSubmitting || !form.event_name || (!form.user_id && !form.team_id);

  return (
    <Layout>
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }}
            className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-2
              ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {notification.type === 'success' ? <SuccessCircle size={24} /> : <AlertTriangle size={24} />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(n => ({ ...n, show: false }))} className="ml-auto p-1 rounded-full hover:bg-white/20">
              <XCircle size={18}/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        variants={pageFadeInUp}
        initial="initial"
        animate="animate"
        className="mb-6 flex items-center space-x-3"
      >
        <ListChecks size={36} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Manage Event Participations</h1>
      </motion.header>

      <motion.form
        variants={pageFadeInUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
        onSubmit={handleRegister}
        className="mb-10 bg-white p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
          <motion.select
            value={form.event_name} // Value is event_name
            onChange={e => setForm({ ...form, event_name: e.target.value })} // Sets event_name
            className="border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
            whileHover={{ borderColor: "#6366F1" }}
          >
            <option value="" disabled>Select an event…</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.name}> {/* Option value is event's name */}
                {ev.name} — {new Date(ev.event_date).toLocaleDateString()}
              </option>
            ))}
          </motion.select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
          <motion.select
            value={form.user_id}
            onChange={e => setForm({ ...form, user_id: e.target.value })}
            className="border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required={!form.team_id}
            whileHover={{ borderColor: "#6366F1" }}
          >
            <option value="" disabled>Select a user…</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </motion.select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team (Optional)</label>
          <motion.select
            value={form.team_id}
            onChange={e => {
              const newTeamId = e.target.value;
              setForm(prevForm => ({
                ...prevForm,
                team_id: newTeamId,
              }));
            }}
            className="border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            whileHover={{ borderColor: "#6366F1" }}
          >
            <option value="">No Team / Select a team...</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </motion.select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <motion.select
            value={form.position}
            onChange={e => setForm({ ...form, position: e.target.value })}
            className="border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            whileHover={{ borderColor: "#6366F1" }}
          >
            {POSITION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </motion.select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
          <motion.input
            type="number"
            min="0"
            max="100"
            value={form.score}
            onChange={e => setForm({ ...form, score: Math.min(100, Math.max(0, Number(e.target.value))) })}
            className="border border-gray-300 p-2 w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            whileHover={{ borderColor: "#6366F1" }}
          />
        </div>
        <motion.button
          type="submit"
          className={`bg-green-600 text-white px-4 py-2.5 rounded-md shadow-md flex items-center justify-center space-x-2
            ${isRegisterButtonDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}
          whileHover={{ scale: isRegisterButtonDisabled ? 1 : 1.05, y: isRegisterButtonDisabled ? 0 : -2 }}
          whileTap={{ scale: isRegisterButtonDisabled ? 1 : 0.95 }}
          disabled={isRegisterButtonDisabled}
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader2 size={20} />
            </motion.div>
          ) : (
            <PlusCircle size={20} />
          )}
          <span>{isSubmitting ? 'Registering...' : 'Register'}</span>
        </motion.button>
      </motion.form>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AnimatePresence>
          {participants.length > 0 ? (
            participants.map(p => (
              <motion.div
                key={p.id}
                layout
                variants={cardFadeInUp}
                className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="flex items-center space-x-3 mb-4 border-b pb-3">
                  <UserCircle2 size={40} className="text-indigo-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 truncate" title={p.event_name}>
                      {p.event_name} {/* This should already display correctly based on fetched data */}
                    </h3>
                    <p className="text-xs text-gray-500">ID: {p.id}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4 flex-grow">
                  <CardDetailItem icon={User} label="User" value={p.user_name} />
                  <CardDetailItem icon={Users} label="Team" value={p.team_name} />
                  {p.event_date && <CardDetailItem icon={CalendarDays} label="Event Date" value={new Date(p.event_date).toLocaleDateString()} />}

                  {editingId === p.id ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Position</label>
                        <motion.select
                          value={editValues.position}
                          onChange={e => setEditValues(v => ({ ...v, position: e.target.value }))}
                          className="border border-gray-300 p-1.5 w-full rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                          autoFocus
                        >
                          {POSITION_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </motion.select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Score</label>
                        <motion.input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.score}
                          onChange={e => setEditValues(v => ({ ...v, score: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                          className="border border-gray-300 p-1.5 w-full rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                        />
                      </div>
                       <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">Team (Optional)</label>
                        <motion.select
                          value={editValues.team_id}
                          onChange={e => setEditValues(v => ({ ...v, team_id: e.target.value }))}
                          className="border border-gray-300 p-1.5 w-full rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                        >
                          <option value="">No Team</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </motion.select>
                      </div>
                    </>
                  ) : (
                    <>
                      <CardDetailItem icon={Award} label="Position" value={p.position} />
                      <CardDetailItem icon={Award} label="Score" value={p.score} />
                    </>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 flex items-center space-x-2 justify-end">
                  {editingId === p.id ? (
                    <>
                      <motion.button
                        onClick={() => saveEdit(p.id)}
                        className={`${actionButtonClass("green")} bg-green-500 hover:bg-green-600 focus:ring-green-400 text-xs px-3 py-1.5`}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        title="Save"
                        disabled={isCardActionLoading === p.id}
                      >
                        {isCardActionLoading === p.id ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                        <span className="ml-1.5">Save</span>
                      </motion.button>
                      <motion.button
                        onClick={cancelEdit}
                        className={`${actionButtonClass("gray")} bg-gray-400 hover:bg-gray-500 focus:ring-gray-300 text-xs px-3 py-1.5`}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        title="Cancel"
                        disabled={isCardActionLoading === p.id}
                      >
                        <XCircle size={16} />
                        <span className="ml-1.5">Cancel</span>
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => startEdit(p)}
                        className={`${actionButtonClass("blue")} bg-blue-500 hover:bg-blue-600 focus:ring-blue-400 text-xs px-3 py-1.5`}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        title="Edit"
                      >
                        <Edit size={16} />
                        <span className="ml-1.5">Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(p.id)}
                        className={`${actionButtonClass("red")} bg-red-500 hover:bg-red-600 focus:ring-red-400 text-xs px-3 py-1.5`}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        title="Delete"
                        disabled={isCardActionLoading === p.id}
                      >
                        {isCardActionLoading === p.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16} />}
                        <span className="ml-1.5">Delete</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
             ( !events.length && !users.length && !teams.length && participants.length === 0 ) ? (
              <motion.div
                className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <Loader2 size={48} className="animate-spin mb-4 text-indigo-500"/>
                <p>Loading participations, events, users, and teams...</p>
              </motion.div>
            ) : (
              <motion.div
                className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <Info size={48} className="mb-4 text-indigo-400"/>
                <p className="text-lg">No participations found.</p>
                <p className="text-sm">Register a new participant using the form above. Ensure all data (events, users, teams) has loaded if lists appear empty.</p>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default Participants;