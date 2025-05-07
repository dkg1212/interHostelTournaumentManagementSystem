import axios from 'axios';

export const login = async (formData) => {
  return await axios.post('http://localhost:5050/api/login', formData);
};
export const signup = async (formData) => {
  return await axios.post('http://localhost:5050/api/signup', formData);
};

export const logout = async (formData) => {
  return await axios.post('http://localhost:5050/api/logout', formData);
};