import axios from 'axios';

// Create an Axios instance with CORS and credentials support
const API = axios.create({
  baseURL: 'http://localhost:5050/api', // Base URL for API requests
  withCredentials: true, // Necessary for sending cookies (JWT)
});

// Signup User
export const signup = async (userData) => {
  try {
    const response = await API.post('/signup', userData); // Assuming your signup route is '/signup'
    return response.data;
  } catch (error) {
    console.error("Signup error:", error.response ? error.response.data : error);
    throw error; // Propagate error to handle it in the frontend
  }
};

// Login User
export const login = async (credentials) => {
  try {
    const response = await API.post('/login', credentials); // Sending login credentials
    return response.data; // { message, user, etc.}
  } catch (error) {
    console.error("Login error:", error.response ? error.response.data : error);
    throw error;
  }
};

// Logout User
export const logout = async () => {
  try {
    const response = await API.post('/logout'); // Assuming you have a logout route in the backend
    return response.data;
  } catch (error) {
    console.error("Logout error:", error.response ? error.response.data : error);
    throw error;
  }
};
