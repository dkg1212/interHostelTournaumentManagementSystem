/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Link might be used if Sidebar is part of this page
// Removed Topbar import
import {
  UserCircle2,
  Edit3,
  Save,
  XCircle as CancelIcon, // Renamed to avoid conflict with notification's XCircle
  Mail,
  Home as HostelIcon, // Renamed to avoid conflict
  ClipboardList as RollNumberIcon, // Example icon for roll number
  Users as GenderIcon, // Example icon for gender
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation Variants
const pageContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } },
};

const formVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 },
    visible: { opacity: 1, height: 'auto', marginTop: '1.5rem', marginBottom: '1.5rem', paddingTop: '1.5rem', paddingBottom: '1.5rem', transition: { duration: 0.4, ease: "circOut" } },
    exit: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.3, ease: "circIn" } },
};


const ProfilePage = () => {
  const [student, setStudent] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    roll_number: '',
    gender: '', // Default to an empty string or a common default like 'male'/'female'
    hostel_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate(); // Keep useNavigate

  const showAppNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), duration);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      if (!token || !userId) {
        showAppNotification('Authentication details missing. Please log in.', 'error');
        setLoading(false);
        // navigate('/login'); // Optional: redirect
        return;
      }

      try {
        const [studentRes, hostelRes] = await Promise.all([
          axios.get(`/api/students/user/${userId}`, { // Assuming /api proxy
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/v1/hostels', { // Assuming /api proxy
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (studentRes.data && studentRes.data.student) {
          const fetchedStudent = studentRes.data.student;
          setStudent(fetchedStudent);
          setFormData({
            roll_number: fetchedStudent.roll_number || '',
            gender: fetchedStudent.gender || '',
            hostel_id: fetchedStudent.hostel_id || '',
          });
        } else {
          setStudent(null); // No profile exists
          showAppNotification('Student profile not found. You might need to create one.', 'error');
        }

        if (hostelRes.data && hostelRes.data.success) {
          setHostels(hostelRes.data.data);
        } else {
          showAppNotification('Failed to fetch hostels list.', 'error');
        }

      } catch (err) {
        console.error("Fetch profile data error:", err);
        showAppNotification(err.response?.data?.message || 'Failed to load profile data.', 'error');
        if (err.response?.status === 404 && err.config.url.includes('/api/students/user/')) {
          setStudent(null); // Student profile specifically not found
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
   
  }, [userId, token]); // navigate is stable, no need to include

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student || !student.id) {
      showAppNotification('Student data is not available for update.', 'error');
      return;
    }
    if (!formData.roll_number || !formData.gender || !formData.hostel_id) {
        showAppNotification('All fields (Roll Number, Gender, Hostel) are required.', 'error');
        return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.put(
        `/api/students/${student.id}`, // Assuming /api proxy
        {...formData, hostel_id: parseInt(formData.hostel_id, 10)}, // Ensure hostel_id is number
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAppNotification('Profile updated successfully!', 'success');
      // Update local student state with new data from response or formData
      setStudent(prev => ({...prev, ...res.data.studentData})); // Assuming backend returns updated student
      setIsEdit(false);
    } catch (err) {
      console.error("Update profile error:", err);
      showAppNotification(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHostelName = (hostelId) => {
    if (!hostelId) return 'Not assigned';
    const hostel = hostels.find((h) => h.id === parseInt(hostelId));
    return hostel ? hostel.name : 'Unknown Hostel';
  };

  // Notification Display Component
  const NotificationDisplay = () => (
    <AnimatePresence>
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }}
          className={`fixed top-20 right-5 z-[100] p-4 rounded-lg shadow-xl text-white flex items-center space-x-2
                      ${notification.type === 'success' ? 'bg-green-500' : 
                        notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {notification.type === 'success' ? <CheckCircle size={24} /> : 
           notification.type === 'error' ? <AlertTriangle size={24} /> : <AlertTriangle size={24} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(n => ({ ...n, show: false }))} className="ml-auto p-1 rounded-full hover:bg-white/20">
            <XCircle size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 size={48} className="animate-spin text-indigo-500 dark:text-indigo-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const ProfileDetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center py-2 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0">
      <Icon size={18} className="text-indigo-500 dark:text-indigo-400 mr-3 flex-shrink-0" />
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-28">{label}:</span>
      <span className="text-sm text-gray-700 dark:text-gray-200">{value || 'N/A'}</span>
    </div>
  );

  return (
    <motion.div 
      variants={pageContainerVariants} 
      initial="hidden" 
      animate="visible"
      className="max-w-3xl mx-auto space-y-6" // Centered content
    >
      <NotificationDisplay />

      <header className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <UserCircle2 size={32} className="mr-3 text-indigo-600 dark:text-indigo-400" />
          Student Profile
        </h1>
      </header>

      {!student && !loading && ( // Show this if student is null and not loading (i.e., 404 or initial error)
        <motion.div
          variants={cardVariants}
          className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-xl shadow-lg p-6 md:p-8 text-center"
        >
          <AlertTriangle size={40} className="mx-auto mb-3 text-yellow-500 dark:text-yellow-400" />
          <h2 className="text-xl md:text-2xl font-semibold">Profile Not Found</h2>
          <p className="mt-2 text-sm md:text-base">
            We couldn't find a student profile associated with your account.
          </p>
          <Link to="/register-student"> {/* Link to profile creation page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-md flex items-center mx-auto transition-colors"
            >
              Create Profile
            </motion.button>
          </Link>
        </motion.div>
      )}

      {student && (
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
                <h2 className="text-xl md:text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {student.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
            </div>
            {!isEdit && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEdit(true)}
                className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center transition-colors"
              >
                <Edit3 size={16} className="mr-2" /> Edit Profile
              </motion.button>
            )}
          </div>

          <div className="space-y-1">
            <ProfileDetailItem icon={RollNumberIcon} label="Roll Number" value={student.roll_number} />
            <ProfileDetailItem icon={GenderIcon} label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A'} />
            <ProfileDetailItem icon={HostelIcon} label="Hostel" value={getHostelName(student.hostel_id)} />
          </div>

          <AnimatePresence>
            {isEdit && (
              <motion.form
                key="edit-profile-form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/50 space-y-5" // Adjusted margin/padding
              >
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Update Your Details:</h3>
                <div>
                  <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    id="roll_number"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleFormChange}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"
                    placeholder="Enter your roll number"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="hostel_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hostel</label>
                  <select
                    id="hostel_id"
                    name="hostel_id"
                    value={formData.hostel_id}
                    onChange={handleFormChange}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map((hostel) => (
                      <option key={hostel.id} value={hostel.id}>
                        {hostel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-60 flex items-center"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save size={18} className="mr-2"/>}
                    Update Profile
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setIsEdit(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium"
                  >
                    <CancelIcon size={18} className="mr-2"/> Cancel
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfilePage;