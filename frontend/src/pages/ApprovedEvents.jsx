/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { getApprovedEvents, registerForEvent } from "../services/eventService";
import { Link, useLocation } from "react-router-dom";
import Topbar from "../components/Toopbar";

const ApprovedEvents = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const loadEvents = async () => {
    try {
      const data = await getApprovedEvents();
      setApprovedEvents(data);
    } catch (error) {
      console.error("Failed to load approved events", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId, eventName) => {
    const confirmRegister = window.confirm(`Are you sure you want to register for "${eventName}"?`);
    if (!confirmRegister) return;

    try {
      await registerForEvent(eventId, eventName);
      alert("Registered successfully!");
      loadEvents();
    } catch (error) {
      if (
        error.response?.data?.message === "User already registered for this event"
      ) {
        alert("You are already registered for this event!");
        loadEvents();
      } else {
        console.error("Error registering for event", error.message);
        alert("Failed to register for the event");
      }
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Sidebar Component
  const Sidebar = () => (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-2xl font-semibold text-indigo-500 mb-6">Dashboard</h2>
      <ul>
        <li>
          <Link to="/dashboard" className="block py-2 px-4 hover:bg-indigo-600">Home</Link>
        </li>
        <li>
          <Link to="/profile" className="block py-2 px-4 hover:bg-indigo-600">Profile</Link>
        </li>
        <li>
          <Link to="/student/events" className="block py-2 px-4 hover:bg-indigo-600">Upcoming Events</Link>
        </li>
      </ul>
    </div>
  );

  if (loading) return <p className="p-4 text-gray-600">Loading approved events...</p>;

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1">
        {/* Topbar */}
        <Topbar />

        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
            Approved Events
          </h2>

          {approvedEvents.length === 0 ? (
            <p className="text-center text-gray-500">No approved events found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {approvedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white shadow-md border rounded-2xl p-5 hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Type:</strong> {event.type}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Description:</strong> {event.description}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Date:</strong>{" "}
                    {new Date(event.event_date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Mode:</strong> {event.event_mode}
                  </p>

                  {event.isRegistered ? (
                    <div className="flex items-center gap-2 text-green-600 font-semibold mt-2">
                      <span className="text-xl">✔</span> Registered
                    </div>
                  ) : (
                    <button
                      className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition"
                      onClick={() => handleRegister(event.id, event.name)}
                    >
                      Register
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedEvents;
