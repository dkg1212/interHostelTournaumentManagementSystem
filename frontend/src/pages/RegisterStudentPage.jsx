import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterStudentPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    roll_number: '',
    hostel_id: '',
    gender: '',
  });

  const [hostels, setHostels] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await axios.get('http://localhost:5050/api/v1/hostels', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHostels(response.data.data);  // Assuming response has a "data" field containing the list of hostels
      } catch (err) {
        setError('Failed to load hostels');
        console.error(err);
      }
    };

    fetchHostels();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !token) {
      setError('User not authenticated');
      return;
    }

    try {
      // Send the form data to the backend API
      await axios.post('http://localhost:5050/api/students/', {
        user_id: userId,
        hostel_id: formData.hostel_id,
        roll_number: formData.roll_number,
        gender: formData.gender,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Student profile created successfully!');
      setError(null);

      // Redirect to student dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard/student');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register student profile.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Create Student Profile</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Roll Number</label>
            <input
              type="text"
              name="roll_number"
              value={formData.roll_number}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Hostel</label>
            <select
              name="hostel_id"
              value={formData.hostel_id}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            >
              <option value="">Select Hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>
                  {hostel.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            >
              <option value="">Select Gender</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="others">Others</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudentPage;
