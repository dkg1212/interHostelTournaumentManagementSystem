import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Toopbar';
import axios from 'axios';

const ReviewResult = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState({
    eventId: '',
    userId: '',
    score: '',
    remarks: '',
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5050/api/eventScores/review', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setScores(response.data.data);
        } else {
          setError('Failed to fetch scores.');
        }
      } catch {
        setError('Error fetching scores.');
      } finally {
        setLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5050/api/events/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) {
          setEvents(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching events', err);
      }
    };

    fetchScores();
    fetchEvents();
  }, []);

  const handleEdit = (scoreId) => {
    navigate(`/edit-score/${scoreId}`);
  };

  const handleApprove = async (scoreId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5050/api/eventScores/${scoreId}/`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('Score approved successfully!');
        setScores((prevScores) =>
          prevScores.map((score) =>
            score.score_id === scoreId
              ? {
                  ...score,
                  tusc_approved: role === 'tusc' ? true : score.tusc_approved,
                  dsw_approved: role === 'dsw' ? true : score.dsw_approved,
                }
              : score
          )
        );
      } else {
        alert('Failed to approve score.');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving score.');
    }
  };

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    setForm({ ...form, eventId });

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5050/api/participations/${eventId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setParticipants(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching participants', err);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateScore = async (e) => {
    e.preventDefault();

    // Log the form data to check if eventId is being passed correctly
    console.log('Form Data:', form);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5050/api/eventScores`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        alert('Score created successfully!');
        setScores((prev) => [...prev, res.data.data]);
        setForm({ eventId: '', userId: '', score: '', remarks: '' });
        setSelectedEvent('');
        setParticipants([]);
      } else {
        alert('Failed to create score.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating score.');
    }
  };

  return (
    <div className="flex">
      <Sidebar role={role} />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Review Event Scores</h1>

          {/* Create Score Section */}
          <form onSubmit={handleCreateScore} className="bg-gray-100 p-4 rounded mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Score (Individual Only)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                name="eventId"
                value={form.eventId}
                onChange={handleEventChange}
                className="p-2 border rounded"
                required
              >
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>

              <select
                name="userId"
                value={form.userId}
                onChange={handleInputChange}
                className="p-2 border rounded"
                required
              >
                <option value="">Select Participant</option>
                {participants.map((p) => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.user_name} - {p.position}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="score"
                value={form.score}
                onChange={handleInputChange}
                placeholder="Score"
                className="p-2 border rounded"
                required
              />
            </div>

            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleInputChange}
              placeholder="Remarks"
              className="w-full mt-4 p-2 border rounded"
            ></textarea>

            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Score
            </button>
          </form>

          {/* Review Table */}
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm bg-white shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border">Event</th>
                    <th className="p-3 border">Hostel</th>
                    <th className="p-3 border">Participant</th>
                    <th className="p-3 border">Score</th>
                    <th className="p-3 border">Remarks</th>
                    <th className="p-3 border">TUSC</th>
                    <th className="p-3 border">DSW</th>
                    <th className="p-3 border">Final</th>
                    {(role === 'dsw' || role === 'tusc') && (
                      <th className="p-3 border">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.score_id} className="hover:bg-gray-50">
                      <td className="p-2 border">{score.event_name}</td>
                      <td className="p-2 border">{score.hostel_name}</td>
                      <td className="p-2 border">{score.user_name}</td>
                      <td className="p-2 border">{score.score}</td>
                      <td className="p-2 border">{score.remarks}</td>
                      <td className="p-2 border text-center">
                        {score.tusc_approved ? '✅' : '❌'}
                      </td>
                      <td className="p-2 border text-center">
                        {score.dsw_approved ? '✅' : '❌'}
                      </td>
                      <td className="p-2 border text-center">
                        {score.final_approved ? '✅' : '❌'}
                      </td>
                      {(role === 'dsw' || role === 'tusc') && (
                        <td className="p-2 border text-center space-y-1">
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full"
                            onClick={() => handleEdit(score.score_id)}
                          >
                            Edit
                          </button>
                          {((role === 'dsw' && !score.dsw_approved) ||
                            (role === 'tusc' && !score.tusc_approved)) && (
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 w-full"
                              onClick={() => handleApprove(score.score_id)}
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewResult;
