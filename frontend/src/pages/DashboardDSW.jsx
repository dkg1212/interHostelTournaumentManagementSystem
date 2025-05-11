/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";
import {
  fetchEventStats,
  approveEntry,
  rejectEntry,
  updateEvent, // Import updateEvent function
} from "../services/eventService";
import { FiCheckCircle, FiXCircle, FiEdit } from "react-icons/fi";

const DashboardDSW = () => {
  const [eventStats, setEventStats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState("pending");

  // For toggling visibility of event sections
  const [showPending, setShowPending] = useState(false);
  const [showApproved, setShowApproved] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null); // Store the event being edited
  const [updatedEventData, setUpdatedEventData] = useState({
    name: "",
    description: "",
    event_date: "",
  }); // Store updated event data

  const loadEvents = async () => {
    try {
      const res = await fetchEventStats();
      setEventStats(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = async (id) => {
    await approveEntry(id);
    await loadEvents();
  };

  const handleReject = async (id) => {
    await rejectEntry(id);
    await loadEvents();
  };

  const handleEdit = (event) => {
    // Set the event being edited and populate the form with its current data
    setEditingEvent(event);
    setUpdatedEventData({
      name: event.name,
      description: event.description,
      event_date: event.event_date,
    });
  };

  const handleUpdate = async () => {
    try {
      await updateEvent(editingEvent.id, updatedEventData);
      setEditingEvent(null); // Close the edit mode
      loadEvents(); // Reload events after update
    } catch (err) {
      setErrorMessage("Error updating event");
      console.error("Error updating event:", err);
    }
  };

  const pending = eventStats.filter((e) => !e.dsw_approved);
  const approved = eventStats.filter((e) => e.dsw_approved);

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
      <Sidebar role="dsw" />
      <div className="flex-1 bg-gray-50">
        <Topbar />
        <div className="p-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">DSW Dashboard</h2>

          {/* Top Action Buttons */}
          <div className="flex gap-6 mb-6">
            <Link to="/participants">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg shadow-md transition-all">
                Review Results
              </button>
            </Link>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-6 mb-6">
            <button
              onClick={() => setShowPending((prev) => !prev)}
              className={`px-6 py-3 rounded-lg shadow-md ${
                showPending
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Pending Events
            </button>
            <button
              onClick={() => setShowApproved((prev) => !prev)}
              className={`px-6 py-3 rounded-lg shadow-md ${
                showApproved
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              Approved Events
            </button>
          </div>

          {/* Conditional Rendering for Pending Events */}
          {showPending && (
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
                          onClick={() => handleEdit(event)} // Trigger editing
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                          <FiEdit className="mr-2" /> Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-gray-600">No pending events.</p>
              )}
            </>
          )}

          {/* Conditional Rendering for Approved Events */}
          {showApproved && (
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

          {/* Edit Event Modal */}
          {editingEvent && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h3 className="text-xl font-semibold text-gray-800">Edit Event</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(); // Call the update function
                  }}
                >
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Event Name</label>
                    <input
                      type="text"
                      value={updatedEventData.name}
                      onChange={(e) =>
                        setUpdatedEventData({ ...updatedEventData, name: e.target.value })
                      }
                      className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={updatedEventData.description}
                      onChange={(e) =>
                        setUpdatedEventData({ ...updatedEventData, description: e.target.value })
                      }
                      className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Event Date</label>
                    <input
                      type="date"
                      value={updatedEventData.event_date}
                      onChange={(e) =>
                        setUpdatedEventData({ ...updatedEventData, event_date: e.target.value })
                      }
                      className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full"
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)} // Close the edit form
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg mr-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                    >
                      Update Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDSW;
