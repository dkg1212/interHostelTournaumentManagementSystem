// src/services/eventService.js
import axios from "axios";

const API_URL = "http://localhost:5050/api";

// Fetch Event Stats
export const fetchEventStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Return the event stats
  } catch (error) {
    console.error("Error fetching event stats:", error.response?.data?.message || error.message);
    throw new Error("Error fetching event stats");
  }
};

// Approve Event
export const approveEntry = async (eventId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/events/approve`, // Updated URL for approval
      { eventId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Event approved successfully");
  } catch (error) {
    console.error("Error approving event:", error.response?.data?.message || error.message);
    alert("Error approving event");
  }
};

// Reject Event
export const rejectEntry = async (eventId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/events/reject`, // Updated URL for rejection
      { eventId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Event rejected successfully");
  } catch (error) {
    console.error("Error rejecting event:", error.response?.data?.message || error.message);
    alert("Error rejecting event");
  }
};

// Create Event (if not already implemented)
export const createEvent = async (eventData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/events`, 
      eventData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error.response?.data?.message || error.message);
    throw new Error("Error creating event");
  }
};
