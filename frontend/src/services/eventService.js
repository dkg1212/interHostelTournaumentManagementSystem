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

// Fetch Approved Events (for event dropdown)
export const fetchApprovedEvents = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/events/approved`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Return list of approved events
  } catch (error) {
    console.error("Error fetching approved events:", error.response?.data?.message || error.message);
    throw new Error("Error fetching approved events");
  }
};

// Fetch All Users (for user dropdown)
export const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Return list of users
  } catch (error) {
    console.error("Error fetching users:", error.response?.data?.message || error.message);
    throw new Error("Error fetching users");
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

// Create Event
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

// Create Event Score
export const createEventScore = async (scoreData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/eventScores`, scoreData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating event score:", error.response?.data?.message || error.message);
    throw new Error("Error creating event score");
  }
};

// Fetch Event By ID
export const fetchEventById = async (eventId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Return event details by ID
  } catch (error) {
    console.error("Error fetching event by ID:", error.response?.data?.message || error.message);
    throw new Error("Error fetching event by ID");
  }
};

// Fetch User By ID (added this function)
export const fetchUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Return user details by ID
  } catch (error) {
    console.error("Error fetching user by ID:", error.response?.data?.message || error.message);
    throw new Error("Error fetching user by ID");
  }
};

// Update Event
export const updateEvent = async (eventId, eventData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/events/${eventId}`, // Put request to update event
      eventData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // Return the updated event data
  } catch (error) {
    console.error("Error updating event:", error.response?.data?.message || error.message);
    throw new Error("Error updating event");
  }
};
