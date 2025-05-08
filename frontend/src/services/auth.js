import API from './api';

export const login = async (formData) => {
  try {
    const response = await API.post('/login', formData);
    console.log('Login Response:', response.data);
    const { token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response.data;
  } catch (err) {
    console.error('Login Error:', err.response?.data || err.message);
    throw new Error('Login failed');
  }
};

export const signup = async (formData) => {
  return await API.post('/signup', formData);
};

export const logout = () => {
  localStorage.removeItem('token');
  return API.post('/logout');
};

export const fetchEventStats = async () => {
  const response = await API.get('/eventScores');
  return response.data;
};

export const approveEntry = async (eventId) => {
  await API.post('/approveEvent', { eventId });
  alert("Event approved successfully");
};

export const rejectEntry = async (eventId) => {
  await API.post('/rejectEvent', { eventId });
  alert("Event rejected successfully");
};
