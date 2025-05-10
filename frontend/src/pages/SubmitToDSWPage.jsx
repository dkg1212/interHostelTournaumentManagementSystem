import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";

const SubmitToDSWPage = () => {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const unsubmittedEvents = res.data.filter((event) => !event.tusc_approved);
      setEvents(unsubmittedEvents);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (eventId) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `/api/events/${eventId}/submit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Event submitted successfully.");
      fetchEvents(); // Refresh the list
    } catch (err) {
      setMessage("Failed to submit event.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="tusc" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Submit Events to DSW</h2>

          {message && <p className="mb-4 text-blue-600">{message}</p>}

          {events.length === 0 ? (
            <p>No events pending submission.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="border p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => handleSubmit(event.id)}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitToDSWPage;
