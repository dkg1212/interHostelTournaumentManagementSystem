import React, { useEffect, useState } from "react";
import {
  getApprovedEvents,
  fetchEventResults,
  updateEventScores,
} from "../services/eventService";

const EventResultReview = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventResults, setEventResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [editedScores, setEditedScores] = useState({});
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getApprovedEvents();
        setApprovedEvents(data);
      } catch (error) {
        console.error("Error loading approved events:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleReviewResults = async (eventId) => {
    setLoadingResults(true);
    try {
      const results = await fetchEventResults(eventId);
      if (results.success) {
        setEventResults(results.results);
        const eventDetails = approvedEvents.find((event) => event.id === eventId);
        setSelectedEvent(eventDetails);
      } else {
        alert("Failed to fetch results for this event.");
      }
    } catch (error) {
      console.error("Error fetching event results:", error.message);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleScoreChange = (userId, newScore) => {
    setEditedScores((prev) => ({
      ...prev,
      [userId]: newScore,
    }));
  };

  

  const handleUpdateSingleScore = async (userId) => {
    const newScore = editedScores[userId];
    if (newScore === undefined || newScore === "") {
      alert("Please enter a score before updating.");
      return;
    }

    try {
      setUpdatingUserId(userId);
      const res = await updateEventScores(selectedEvent.id, userId, newScore);
      if (res.success) {
        alert("Score updated successfully!");
        handleReviewResults(selectedEvent.id);
      } else {
        alert("Failed to update score.");
      }
    } catch (error) {
      console.error("Error updating score:", error.message);
      alert("Something went wrong while updating score.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) return <p className="p-4">Loading approved events...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Review Approved Event Results
      </h2>

      {approvedEvents.length === 0 ? (
        <p className="text-center text-gray-500">No approved events to review.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {approvedEvents.map((event) => (
            <div key={event.id} className="border rounded-xl shadow-md p-5">
              <h3 className="text-xl font-semibold text-blue-800">{event.name}</h3>
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {event.type}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong>{" "}
                {new Date(event.event_date).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Mode:</strong> {event.event_mode}
              </p>

              <button
                onClick={() => handleReviewResults(event.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                Review Result
              </button>

              {selectedEvent && selectedEvent.id === event.id && (
                <div className="mt-4">
                  <h4 className="font-bold text-lg">Event Details</h4>
                  <p>
                    <strong>Name:</strong> {selectedEvent.name}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedEvent.description}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedEvent.type}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedEvent.event_date).toLocaleString()}
                  </p>
                  <p>
                    <strong>Mode:</strong> {selectedEvent.event_mode}
                  </p>

                  <h5 className="mt-4 font-semibold">
                    Participants and Results:
                  </h5>
                  <ul>
                    {eventResults?.map((participant) => (
                      <li
                        key={participant.user_id}
                        className="flex justify-between items-center text-sm my-2 border-b pb-2"
                      >
                        <span className="font-medium">
                          {participant.user_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="p-1 border rounded w-20"
                            value={
                              editedScores[participant.user_id] ??
                              participant.score
                            }
                            onChange={(e) =>
                              handleScoreChange(
                                participant.user_id,
                                e.target.value
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              handleUpdateSingleScore(participant.user_id)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            disabled={updatingUserId === participant.user_id}
                          >
                            {updatingUserId === participant.user_id
                              ? "Updating..."
                              : "Update"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {loadingResults && (
                <div className="mt-4 text-center text-gray-500">
                  <p>Loading results...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventResultReview;
