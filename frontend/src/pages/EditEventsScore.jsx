// src/pages/EditEventScore.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchEventScoreById, updateEventScore } from "../services/eventScoreService";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";

const EditEventScore = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadScore = async () => {
      try {
        const res = await fetchEventScoreById(id);
        setScore(res.data); // assuming your backend returns { success, data }
      } catch (err) {
        console.error(err);
        setError("Failed to load event score.");
      } finally {
        setLoading(false);
      }
    };
    loadScore();
  }, [id]);

  const handleChange = (e) => {
    setScore({ ...score, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        score: score.score,
        remarks: score.remarks,
      };
      await updateEventScore(id, updated);
      alert("Event score updated!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to update score.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!score) return <p>{error || "Score not found."}</p>;

  return (
    <div className="flex">
      <Sidebar role="dsw" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Event Score</h1>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block mb-1 font-medium">Event</label>
              <input
                type="text"
                value={score.event_name || ""}
                disabled
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Hostel</label>
              <input
                type="text"
                value={score.hostel_name || ""}
                disabled
                className="w-full border px-3 py-2 rounded bg-gray-100"
              />
            </div>
            {score.user_name && (
              <div>
                <label className="block mb-1 font-medium">User</label>
                <input
                  type="text"
                  value={score.user_name}
                  disabled
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                />
              </div>
            )}
            {score.team_name && (
              <div>
                <label className="block mb-1 font-medium">Team</label>
                <input
                  type="text"
                  value={score.team_name}
                  disabled
                  className="w-full border px-3 py-2 rounded bg-gray-100"
                />
              </div>
            )}
            <div>
              <label className="block mb-1 font-medium">Score</label>
              <input
                type="number"
                name="score"
                value={score.score}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Remarks</label>
              <textarea
                name="remarks"
                value={score.remarks || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventScore;
