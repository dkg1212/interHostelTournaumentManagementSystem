import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:5050/api/eventScores';

// Function to get the Authorization header from localStorage
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Fetch all event scores
export const fetchEventScores = async () => {
  try {
    const res = await axios.get(API_URL, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error('Error fetching event scores:', error);
    throw new Error('Failed to fetch event scores');
  }
};

// Approve event result
export const approveEventResult = async (eventId, role) => {
  try {
    const res = await axios.post(
      `${API_URL}/approve`,
      { eventId, role },
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error('Error approving event result:', error);
    throw new Error('Failed to approve event result');
  }
};

// Fetch one event score by ID (for editing)
export const fetchEventScoreById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error(`Error fetching event score with ID ${id}:`, error);
    throw new Error(`Failed to fetch event score with ID ${id}`);
  }
};

// Update event score by ID
export const updateEventScore = async (id, updatedData) => {
  try {
    const res = await axios.put(
      `${API_URL}/${id}`,
      updatedData,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error(`Error updating event score with ID ${id}:`, error);
    throw new Error(`Failed to update event score with ID ${id}`);
  }
};

// Delete event score by ID
export const deleteEventScore = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return res.data;
  } catch (error) {
    console.error(`Error deleting event score with ID ${id}:`, error);
    throw new Error(`Failed to delete event score with ID ${id}`);
  }
};

// Create a new event score (correct version)
export const createEventScore = async (scoreData) => {
  try {
    const token = localStorage.getItem('token');
    // Ensure scoreData contains event_id, hostel_id, and score (mandatory fields)
    if (!scoreData.event_id || !scoreData.hostel_id || !scoreData.score) {
      throw new Error('Event ID, Hostel ID, and Score are required fields.');
    }
    
    const res = await axios.post(
      'http://localhost:5050/api/eventScores', // ✅ matches your router
      scoreData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error creating event score:', error.response?.data || error.message);
    throw new Error('Failed to create event score');
  }
};

