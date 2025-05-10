/* eslint-disable no-unused-vars */
// src/pages/DashboardDSW.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";
import {
  fetchEventStats,
  approveEntry,
  rejectEntry,
} from "../services/eventService";

const DashboardDSW = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetchEventStats();
        if (response.success) {
          setEvents(response.data);
        } else {
          setError("Failed to fetch events.");
        }
      } catch (err) {
        setError("Error fetching event stats.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleAction = async (eventId, action) => {
    setActionLoading((prev) => ({ ...prev, [eventId]: true }));

    try {
      if (action === "approve") {
        await approveEntry(eventId);
        alert("Approved successfully");
      } else {
        await rejectEntry(eventId);
        alert("Rejected successfully");
      }

      // Remove event from the list
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      alert("Action failed");
    } finally {
      setActionLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <div className="flex">
      <Sidebar role="dsw" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">DSW Dashboard – Event Approvals</h1>
            <a
              href="/dashboard/dsw/review-result"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Review Results →
            </a>
          </div>

          {loading ? (
            <p>Loading events...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">No events pending approval.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border bg-white shadow rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Description</th>
                    <th className="p-3 border">Date</th>
                    <th className="p-3 border">TUSC Approved</th>
                    <th className="p-3 border">DSW Approved</th>
                    <th className="p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{event.name}</td>
                      <td className="p-3 border">{event.description}</td>
                      <td className="p-3 border">
                        {new Date(event.event_date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3 border text-center">
                        {event.tusc_approved ? "✅" : "❌"}
                      </td>
                      <td className="p-3 border text-center">
                        {event.dsw_approved ? "✅" : "❌"}
                      </td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => handleAction(event.id, "approve")}
                          disabled={actionLoading[event.id]}
                          className="bg-green-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                          aria-label="Approve event"
                        >
                          {actionLoading[event.id] ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(event.id, "reject")}
                          disabled={actionLoading[event.id]}
                          className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                          aria-label="Reject event"
                        >
                          {actionLoading[event.id] ? "Rejecting..." : "Reject"}
                        </button>
                      </td>
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

export default DashboardDSW;
