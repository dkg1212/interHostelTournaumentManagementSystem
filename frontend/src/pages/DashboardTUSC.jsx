 import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";
import {
  createEvent,
  fetchEventStats,
  approveEntry,
  rejectEntry,
  updateEvent,
} from "../services/eventService";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const DashboardTUSC = () => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStats, setEventStats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventSection, setShowEventSection] = useState(false);
  const [viewMode, setViewMode] = useState("pending");

  // State for editing events
  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedEventData, setUpdatedEventData] = useState({
    name: "",
    description: "",
    event_date: "",
  });

  const loadEvents = async () => {
    try {
      const res = await fetchEventStats();
      setEventStats(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    if (showEventSection) {
      loadEvents();
    }
  }, [showEventSection]);

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
      setShowCreateForm(false);
      setEventName("");
      setEventDescription("");
      setEventDate("");
      if (showEventSection) await loadEvents();
    } catch {
      setErrorMessage("Error creating event. Please try again.");
    }
  };

  const handleApprove = async (id) => {
    await approveEntry(id);
    await loadEvents();
  };

  const handleReject = async (id) => {
    await rejectEntry(id);
    await loadEvents();
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setUpdatedEventData({
      name: event.name,
      description: event.description,
      event_date: event.event_date,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updatedEventData.name || !updatedEventData.description || !updatedEventData.event_date) {
      setErrorMessage("All fields are required.");
      return;
    }
    try {
      await updateEvent(editingEvent.id, updatedEventData);
      setErrorMessage("");
      setEditingEvent(null); // Close modal after update
      loadEvents();
    } catch {
      setErrorMessage("Error updating event. Please try again.");
    }
  };

  const pending = eventStats.filter((e) => !e.tusc_approved);
  const approved = eventStats.filter((e) => e.tusc_approved);

  const badge = (label, ok) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {label}: {ok ? "✔" : "✘"}
    </span>
  );

  return (
    <div className="flex">
      <Sidebar role="tusc" />
      <div className="flex-1 bg-gray-50">
        <Topbar />
        <div className="p-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">TUSC Dashboard</h2>

          {/* Top Action Buttons */}
          <div className="flex gap-6 mb-6">
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md transition-all"
            >
              {showCreateForm ? "Close Form" : "Create Event"}
            </button>

            <button
              onClick={() => setShowEventSection((prev) => !prev)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg shadow-md transition-all"
            >
              {showEventSection ? "Hide Events" : "View Events"}
            </button>

            <Link to="/participants">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg shadow-md transition-all">
                Manage Participants
              </button>
            </Link>
          </div>

          {/* Create Event Form */}
          {showCreateForm && (
            <form
              onSubmit={handleEventSubmit}
              className="space-y-6 mb-8 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-2xl font-semibold mb-4">Create New Event</h3>
              <div>
                <label className="block text-lg font-medium">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg mt-2"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium">Description</label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg mt-2"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium">Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full border-2 px-4 py-3 rounded-lg mt-2"
                  required
                />
              </div>
              {errorMessage && (
                <p className="text-red-500">{errorMessage}</p>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit Event Form */}
          {editingEvent && (
            <form
              onSubmit={handleUpdate}
              className="space-y-6 mb-8 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-2xl font-semibold mb-4">Edit Event</h3>
              <div>
                <label className="block text-lg font-medium">Event Name</label>
                <input
                  type="text"
                  value={updatedEventData.name}
                  onChange={(e) => setUpdatedEventData({ ...updatedEventData, name: e.target.value })}
                  className="w-full border-2 px-4 py-3 rounded-lg mt-2"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium">Description</label>
                <textarea
                  value={updatedEventData.description}
                  onChange={(e) => setUpdatedEventData({ ...updatedEventData, description: e.target.value })}
                  className="w-full border-2 px-4 py-3 rounded-lg mt-2"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium">Date</label>
                <input
                  type="date"
                  value={updatedEventData.event_date}
                  onChange={(e) => setUpdatedEventData({ ...updatedEventData, event_date: e.target.value })}
                  className="w-full border-2 px-4 py-3 rounded-lg mt-2"
                  required
                />
              </div>
              {errorMessage && (
                <p className="text-red-500">{errorMessage}</p>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Show Events Section after toggle */}
          {showEventSection && (
            <div>
              {/* Buttons for Pending/Approved Events */}
              <div className="flex gap-6 mb-6">
                <button
                  onClick={() => setViewMode("pending")}
                  className={`px-6 py-3 rounded-lg shadow-md ${
                    viewMode === "pending"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Pending Events
                </button>
                <button
                  onClick={() => setViewMode("approved")}
                  className={`px-6 py-3 rounded-lg shadow-md ${
                    viewMode === "approved"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Approved Events
                </button>
              </div>

              {viewMode === "pending" ? (
                <>
                  <h3 className="text-2xl font-semibold text-gray-800">Pending Events</h3>
                  {pending.length ? (
                    <div className="grid grid-cols-1 gap-6 mt-6">
                      {pending.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200"
                        >
                          <h4 className="text-xl font-semibold text-gray-800">{event.name}</h4>
                          <p className="text-gray-600">{event.description}</p>
                          <p className="text-sm text-gray-500 mt-2">Date: {event.event_date}</p>
                          <div className="mt-4 flex space-x-4">
                            {badge("DSW", event.dsw_approved)}
                            {badge("TUSC", event.tusc_approved)}
                          </div>
                          <div className="mt-4 flex space-x-4">
                            <button
                              onClick={() => handleApprove(event.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                              <FiCheckCircle className="mr-2" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(event.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                              <FiXCircle className="mr-2" /> Reject
                            </button>
                            <button
                              onClick={() => handleEdit(event)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-gray-600">No pending events.</p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-gray-800">Approved Events</h3>
                  {approved.length ? (
                    <div className="grid grid-cols-1 gap-6 mt-6">
                      {approved.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200"
                        >
                          <h4 className="text-xl font-semibold text-gray-800">{event.name}</h4>
                          <p className="text-gray-600">{event.description}</p>
                          <p className="text-sm text-gray-500 mt-2">Date: {event.event_date}</p>
                          <div className="mt-4 flex space-x-4">
                            {badge("DSW", event.dsw_approved)}
                            {badge("TUSC", event.tusc_approved)}
                          </div>
                          <div className="mt-4 flex space-x-4">
                            <button
                              onClick={() => handleReject(event.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                            >
                              <FiXCircle className="mr-2" /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-gray-600">No approved events.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTUSC;
