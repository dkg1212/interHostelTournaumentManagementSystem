import axios from 'axios';

const API = 'http://localhost:5050/api/v1/hostels'; // adjust port if needed

export const fetchHostels = async () => {
  return await axios.get(`${API}/getAll`);
};

export const fetchHostelById = async (id) => {
  return await axios.get(`${API}/hostels/${id}`);
};
