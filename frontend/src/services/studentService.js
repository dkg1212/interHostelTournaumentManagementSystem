/* eslint-disable no-unused-vars */
import axios from "axios";

const API_URL = "/api/students";

const authHeader = () => {
  const token = localStorage.getItem("token"); // Assuming you store JWT in localStorage
  return { Authorization: `Bearer ${token}` };
};

export const getStudentProfile = async () => {
  const res = await axios.get(`${API_URL}`, {
    headers: authHeader(),
  });

  // Find own student record from the list (you can optimize this in backend later)
  const all = res.data;
  const token = JSON.parse(atob(localStorage.getItem("token").split('.')[1]));
  const currentUserId = token.id;

  const own = all.find((s) => s.user_id === currentUserId);
  if (!own) throw new Error("Student profile not found");
  return own;
};

export const registerOrUpdateStudent = async (data) => {
  try {
    // Try updating first
    await axios.put(`${API_URL}/update-self`, data, {
      headers: authHeader(),
    });
  } catch (err) {
    // If update fails due to missing profile, fall back to register
    await axios.post(`${API_URL}/register`, data, {
      headers: authHeader(),
    });
  }
};
