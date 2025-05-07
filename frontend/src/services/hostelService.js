import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api/v1/hostels'; // Make sure port matches

export const fetchHostels = () => axios.get(`${BASE_URL}/getAll`);

export const getHostelById = (id) => axios.get(`${BASE_URL}/get/${id}`);

export const createHostel = (hostelData) =>
  axios.post(`${BASE_URL}/addHostel`, hostelData);

export const updateHostel = (id, hostelData) => {
  return axios.put(`${BASE_URL}/updateHostel/${id}`, hostelData);
};

export const deleteHostel = (id) =>
  axios.delete(`${BASE_URL}/deleteHostel/${id}`);
