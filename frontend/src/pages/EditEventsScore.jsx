/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";
import { fetchEventStats, approveEntry, rejectEntry, updateEvent } from "../services/eventService";
import { FiCheckCircle, FiXCircle, FiEdit } from "react-icons/fi";

const DashboardDSW = () => {
  const [eventStats, setEventStats] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState("pending");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    name: "",
    description: "",
    event_date: "",
  });
  const navigate = useNavigate();

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
    setSelectedEvent(event);
    setEventFormData({
      name: event.name,
      description: event.description,
      event_date: event.event_date,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await updateEvent(selectedEvent.id, eventFormData);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      setErrorMessage("Error updating event. Please try again.");
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

          {/* Event Display based on View Mode */}
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
                        <button
                          onClick={() => handleEdit(event)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                          <FiEdit className="mr-2" /> Edit
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

        {/* Edit Event Form */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Edit Event</h3>
              {errorMessage && <p className="text-red-600">{errorMessage}</p>}
              <form onSubmit={handleSubmitEdit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Event Name</label>
                  <input
                    type="text"
                    name="name"
                    value={eventFormData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={eventFormData.description}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Event Date</label>
                  <input
                    type="date"
                    name="event_date"
                    value={eventFormData.event_date}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDSW;
