import API from './api';

export const fetchHostels = () => API.get('/v1/hostels/getAll');

export const getHostelById = (id) => API.get(`/v1/hostels/get/${id}`);

export const createHostel = (hostelData) =>
  API.post('/v1/hostels/addHostel', hostelData);

export const updateHostel = (id, hostelData) =>
  API.put(`/v1/hostels/updateHostel/${id}`, hostelData);

export const deleteHostel = (id) =>
  API.delete(`/v1/hostels/deleteHostel/${id}`);
