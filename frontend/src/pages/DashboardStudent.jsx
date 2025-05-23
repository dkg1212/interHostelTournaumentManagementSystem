import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Topbar from "../components/Toopbar";  // Import the Topbar component

const DashboardStudent = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Show sidebar only if not on /dashboard
  const showSidebar = location.pathname !== '/dashboard';

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!token || !userId) {
          setError('Missing token or user ID');
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:5050/api/students/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.student) {
          setStudent(res.data.student);
        } else {
          setStudent(null);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setStudent(null);
        } else {
          console.error(err);
          setError(err.response?.data?.message || 'Failed to fetch student');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [userId, token]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleRegisterProfile = () => {
    navigate('/register-student');
  };

  // Sidebar Component
  // eslint-disable-next-line no-unused-vars
  const Sidebar = ({ role }) => (
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

  if (loading) return <p className="text-gray-600 p-4">Loading student data...</p>;
  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;

  return (
    <div className="flex">
      {/* Sidebar: only show if not on /dashboard */}
      {showSidebar && <Sidebar role="student" />}

      <div className="flex-1">
        {/* Topbar */}
        <Topbar />

        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>

          {student ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-indigo-600">Welcome, {student.name}</h2>
                <div className="space-y-2 text-gray-700 mt-4">
                  <p><strong>Email:</strong> {student.email}</p>
                  <p><strong>Hostel:</strong> {student.hostel_name || 'Not assigned'}</p>
                </div>
                <button
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={handleProfileClick}
                >
                  View Profile
                </button>
              </div>

              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-indigo-600">Upcoming Events</h3>
                <p className="text-gray-700 mt-2">
                  Here you can see your upcoming events, register for events, and check your results.
                </p>
                <div className="mt-3">
                  <Link to="/student/events" className="text-blue-500 underline">
                    View Upcoming Events
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-yellow-100 text-yellow-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold">No Student Profile Found</h2>
              <p className="mt-2">You haven't created a student profile yet. Please register to continue.</p>
              <button
                className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                onClick={handleRegisterProfile}
              >
                Create Student Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStudent;
