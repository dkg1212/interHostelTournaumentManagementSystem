import axios from 'axios';

const API_URL = 'http://localhost:5050/api';

export const fetchEventStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/eventScores`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new Error('Error fetching event stats');
  }
};

export const approveEntry = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `${API_URL}/approveEvent`,
      { eventId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert('Event approved successfully');
  } catch (error) {
    console.error('Error approving event:', error);
    alert('Error approving event');
  }
};

export const rejectEntry = async (eventId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `${API_URL}/rejectEvent`,
      { eventId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert('Event rejected successfully');
  } catch (error) {
    console.error('Error rejecting event:', error);
    alert('Error rejecting event');
  }
};
