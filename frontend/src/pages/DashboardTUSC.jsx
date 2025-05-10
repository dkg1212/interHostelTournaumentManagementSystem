/* eslint-disable no-unused-vars */
// src/pages/DashboardTUSC.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";
import {
  createEvent,
  fetchEventStats,
  approveEntry,
  rejectEntry,
} from "../services/eventService";

const DashboardTUSC = () => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStats, setEventStats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch event stats when the component mounts
  useEffect(() => {
    const getEventStats = async () => {
      try {
        const stats = await fetchEventStats();
        setEventStats(stats);
      } catch (error) {
        console.error("Error fetching event stats:", error.message);
      }
    };
    getEventStats();
  }, []);

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventName || !eventDescription || !eventDate) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      await createEvent({
        name: eventName,
        description: eventDescription,
        event_date: eventDate,
      });
      setErrorMessage("");
      alert("Event created successfully!");
      setShowCreateForm(false); // Hide the form
      setEventName(""); // Clear form
      setEventDescription("");
      setEventDate("");

      // Refresh the event stats
      const stats = await fetchEventStats();
      setEventStats(stats);
    } catch (error) {
      setErrorMessage("Error creating event, please try again.");
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await approveEntry(eventId);
      setEventStats((prevStats) =>
        prevStats.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error("Error approving event:", error.message);
    }
  };

  const handleReject = async (eventId) => {
    try {
      await rejectEntry(eventId);
      setEventStats((prevStats) =>
        prevStats.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error("Error rejecting event:", error.message);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="tusc" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">TUSC Dashboard</h2>

          {/* Create Event Toggle */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
            >
              Create Event
            </button>
          ) : (
            <form onSubmit={handleEventSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Event Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {errorMessage && (
                <p className="text-red-500">{errorMessage}</p>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Event Stats */}
          <h3 className="text-xl font-bold mt-6">Pending Events</h3>
          {eventStats.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {eventStats.map((event) => (
                <li key={event.id} className="border p-4 rounded">
                  <h4 className="text-lg font-semibold">{event.name}</h4>
                  <p>{event.description}</p>
                  <p className="text-sm text-gray-500">Date: {event.date}</p>
                  <div className="mt-4">
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-4"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-600">No pending events.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTUSC;
