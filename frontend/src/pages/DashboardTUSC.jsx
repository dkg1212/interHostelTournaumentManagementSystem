 
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../components/Toopbar"; // Keep Topbar for navigation
import {
  createEvent,
  fetchEventStats,
  approveEntry,
  rejectEntry,
  updateEvent,
  deleteEvent, // Added deleteEvent
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
  const [eventMode, setEventMode] = useState("team");  // 'team' or 'solo'
  const [eventType, setEventType] = useState("sports"); // 'sports' or 'cultural'
   
  const [maxTeamMembers, setMaxTeamMembers] = useState("");

  

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
    if (!eventName || !eventDescription || !eventDate || !eventMode || !eventType) {
      setErrorMessage("All fields are required.");
      return;
    }
    try {
      await createEvent({
        name: eventName,
        description: eventDescription,
        event_date: eventDate,
        event_mode: eventMode,  // 'solo' or 'team'
        type: eventType,  // 'sports' or 'cultural'
        max_team_members: eventMode === "team" ? parseInt(maxTeamMembers) : null,
      });
      setErrorMessage("");
      setShowCreateForm(false);
      setEventName("");
      setEventDescription("");
      setEventDate("");
      setEventMode("team"); // Reset to default
      setEventType("sports"); // Reset to default
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

  const handleDelete = async (id) => {
    await deleteEvent(id);
    await loadEvents();
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
    <div className="flex flex-col">
      {/* Topbar */}
      <Topbar />

      {/* Sidebar */}
      <div className="flex flex-row">
        <div className="bg-gray-800 text-white w-64 h-screen flex flex-col justify-between p-6">
          <div>
            <h3 className="text-2xl font-semibold mb-6">TUSC Dashboard</h3>

            {/* Sidebar navigation buttons */}
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg w-full mb-4"
            >
              {showCreateForm ? "Close Form" : "Create Event"}
            </button>

            <button
              onClick={() => setShowEventSection((prev) => !prev)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg w-full mb-4"
            >
              {showEventSection ? "Hide Events" : "View Events"}
            </button>

            <Link to="/participants">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg w-full">
                Manage Participants
              </button>
            </Link>
          </div>

          {/* Bottom buttons */}
          <div className="mt-auto">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg w-full">
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 max-w-7xl mx-auto">
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
              <div>
    <label className="block text-lg font-medium">Event Category</label>
    <select
      value={eventType}
      onChange={(e) => setEventType(e.target.value)}
      className="w-full border-2 px-4 py-3 rounded-lg mt-2"
      required
    >
      <option value="sports">Sports</option>
      <option value="cultural">Cultural</option>
    </select>
  </div>
  <div>
    <label className="block text-lg font-medium">Event Mode</label>
    <select
      value={eventMode}
      onChange={(e) => setEventMode(e.target.value)}
      className="w-full border-2 px-4 py-3 rounded-lg mt-2"
      required
    >
      <option value="solo">Solo</option>
      <option value="team">Team</option>
    </select>
  </div>

  {/* Max Team Members (Only visible for team events) */}
  {eventMode === "team" && (
    <div>
      <label className="block text-lg font-medium">Max Team Members</label>
      <input
        type="number"
        value={maxTeamMembers}
        onChange={(e) => setMaxTeamMembers(e.target.value)}
        className="w-full border-2 px-4 py-3 rounded-lg mt-2"
        min={1}
        required
      />
    </div>
  )}

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

              {/* Display events based on selected mode */}
              {viewMode === "pending" &&
                pending.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-6 rounded-lg shadow-md mb-4"
                  >
                    <h4 className="text-xl font-semibold">{event.name}</h4>
                    <p>{event.description}</p>
                    <p className="text-gray-500">Date: {new Date(event.event_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Type: {event.type}</p> {/* Event Type */}
          <p className="text-sm text-gray-500">Category: {event.event_mode}</p> {/* Event Category */}

                    <div className="mt-4">
                      {badge("TUSC Approved", event.tusc_approved)}
                      <div className="mt-2">
                        <button
                          onClick={() => handleApprove(event.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {viewMode === "approved" &&
                approved.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white p-6 rounded-lg shadow-md mb-4"
                  >
                    <h4 className="text-xl font-semibold">{event.name}</h4>
                    <p>{event.description}</p>
                    <p className="text-gray-500">Date: {new Date(event.event_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Type: {event.type}</p> {/* Event Type */}
          <p className="text-sm text-gray-500">Category: {event.event_mode}</p> {/* Event Category */}

                    <div className="mt-4">
                      {badge("TUSC Approved", event.tusc_approved)}
                      <div className="mt-2">
                      <button
                          onClick={() => handleReject(event.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTUSC;
