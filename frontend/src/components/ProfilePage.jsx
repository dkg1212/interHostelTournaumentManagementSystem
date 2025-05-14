import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Topbar from "../components/Toopbar";

const ProfilePage = () => {
  const [student, setStudent] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    roll_number: '',
    gender: '',
    hostel_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostels, setHostels] = useState([]);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!token || !userId) {
          setError('Missing token or user ID');
          setLoading(false);
          return;
        }

        const studentRes = await axios.get(`http://localhost:5050/api/students/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (studentRes.data.student) {
          setStudent(studentRes.data.student);
          setFormData({
            roll_number: studentRes.data.student.roll_number,
            gender: studentRes.data.student.gender,
            hostel_id: studentRes.data.student.hostel_id,
          });
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch student');
      } finally {
        setLoading(false);
      }
    };

    const fetchHostels = async () => {
      try {
        const hostelRes = await axios.get('http://localhost:5050/api/v1/hostels', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (hostelRes.data.success) {
          setHostels(hostelRes.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch hostels');
      }
    };

    fetchStudent();
    fetchHostels();
  }, [userId, token]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5050/api/students/${student.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Profile updated successfully!');
      setIsEdit(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const getHostelName = (hostelId) => {
    const hostel = hostels.find((h) => h.id === parseInt(hostelId));
    return hostel ? hostel.name : 'Not assigned';
  };

  if (loading) return <p className="text-gray-600 p-4">Loading profile...</p>;
  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;

  // Sidebar component
  const Sidebar = () => (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-2xl font-semibold text-indigo-500 mb-6">Dashboard</h2>
      <ul>
        <li>
          <Link to="/dashboard" className="block py-2 px-4 hover:bg-indigo-600">Home</Link>
        </li>
        <li>
          <Link to="/profile" className="block py-2 px-4 hover:bg-indigo-600">Profile</Link>
        </li>
        <li>
          <Link to="/student/events" className="block py-2 px-4 hover:bg-indigo-600">Upcoming Events</Link>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1">
        {/* Topbar */}
        <Topbar />
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

        {student ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">Welcome, {student.name}</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Hostel:</strong> {getHostelName(student.hostel_id)}</p>
              <p><strong>Roll Number:</strong> {student.roll_number}</p>
              <p><strong>Gender:</strong> {student.gender}</p>
            </div>

            {isEdit ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                  type="text"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleFormChange}
                  className="border p-2 rounded w-full"
                  placeholder="Roll Number"
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
                <select
                  name="hostel_id"
                  value={formData.hostel_id}
                  onChange={handleFormChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>

                <div className="flex space-x-4">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Profile</button>
                  <button type="button" onClick={() => setIsEdit(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="mt-6">
                <button onClick={() => setIsEdit(true)} className="bg-yellow-500 text-white px-4 py-2 rounded">Edit Profile</button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No student profile found for this account.</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default ProfilePage;
