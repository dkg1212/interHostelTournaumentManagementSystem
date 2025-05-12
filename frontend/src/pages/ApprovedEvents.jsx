import React, { useEffect, useState } from "react";
import { getApprovedEvents, registerForEvent } from "../services/eventService";

const ApprovedEvents = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="p-4 text-gray-600">Loading approved events...</p>;

  return (
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
  );
};

export default ApprovedEvents;
