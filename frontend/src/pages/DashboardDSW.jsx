/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Topbar from "../components/Toopbar"; // Keep Topbar for navigation (ensure it's styled)
import EventResultReview from "./EventResultReview"; // Adjust path as needed
import {
  createEvent,
  fetchEventStats,
  approveEntry,
  rejectEntry,
  updateEvent,
  deleteEvent,
} from "../services/eventService";
import {
  PlusCircle, // Create Event
  Eye,        // View Events / Review Results
  ListChecks, // Manage Participants
  Sun,        // Light Theme
  Moon,       // Dark Theme
  LogOut,
  CheckCircle,
  XCircle,
  Edit3,      // Edit
  Trash2,     // Delete
  CalendarDays,
  Users,      // Team mode
  User,       // Solo mode
  Archive,    // Generic icon for event sections
  AlertTriangle, // For errors or pending status
  FileText,   // For no items found
  Loader2,    // For loading states
  Settings2,  // General Settings / View Mode
  ShieldCheck, // For Dashboard Title Icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants (consistent with other components)
const formVariants = {
  hidden: { opacity: 0, y: -30, height: 0, overflow: 'hidden' },
  visible: { opacity: 1, y: 0, height: 'auto', overflow: 'visible', transition: { duration: 0.4, ease: "circOut" } },
  exit: { opacity: 0, y: -30, height: 0, overflow: 'hidden', transition: { duration: 0.3, ease: "circIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeIn" } },
};

const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};


const DashboardTUSC = () => {
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    event_date: "",
    event_mode: "team",
    type: "sports",
    max_team_members: "",
  });
  const [eventStats, setEventStats] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventSection, setShowEventSection] = useState(true); // Default to true
  const [viewMode, setViewMode] = useState("pending"); // 'pending' or 'approved'
  const [showReview, setShowReview] = useState(false);
  const [selectedEventIdForReview, setSelectedEventIdForReview] = useState(null);
  const navigate = useNavigate();

  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedEventData, setUpdatedEventData] = useState({
    name: "",
    description: "",
    event_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const showAppNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), duration);
  };

  const handleReviewClick = (eventId) => {
    setSelectedEventIdForReview(eventId || 4);
    setShowReview(true);
  };

  const loadEvents = async () => {
    try {
      const res = await fetchEventStats();
      setEventStats(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      showAppNotification("Failed to load events.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("theme");
    navigate("/login");
  };

  useEffect(() => {
    if (showEventSection) {
      loadEvents();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEventSection, viewMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventData.name || !eventData.description || !eventData.event_date || (eventData.event_mode === "team" && !eventData.max_team_members)) {
      showAppNotification("Please fill all required fields.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await createEvent({
        ...eventData,
        max_team_members: eventData.event_mode === "team" ? parseInt(eventData.max_team_members) : null,
      });
      showAppNotification("Event created successfully!", "success");
      setShowCreateForm(false);
      setEventData({ name: "", description: "", event_date: "", event_mode: "team", type: "sports", max_team_members: "" });
      if (showEventSection) await loadEvents();
    } catch (err) {
      showAppNotification(err.response?.data?.message || "Error creating event.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveEntry(id);
      showAppNotification("Event approved!", "success");
      await loadEvents();
    } catch (err) {
      showAppNotification("Failed to approve event.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEntry(id);
      showAppNotification("Event action successful!", "success"); // Generic message for reject/un-approve
      await loadEvents();
    } catch (err) {
      showAppNotification("Failed to process event action.", "error");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setUpdatedEventData({
      name: event.name,
      description: event.description,
      event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : "",
    });
    setShowCreateForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updatedEventData.name || !updatedEventData.description || !updatedEventData.event_date) {
      showAppNotification("All fields are required for updating.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateEvent(editingEvent.id, updatedEventData);
      showAppNotification("Event updated successfully!", "success");
      setEditingEvent(null);
      loadEvents();
    } catch (err) {
      showAppNotification(err.response?.data?.message || "Error updating event.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await deleteEvent(id);
        showAppNotification("Event deleted successfully!", "success");
        await loadEvents();
      } catch (err) {
        showAppNotification("Error deleting event.", "error");
      }
    }
  };

  const pending = eventStats.filter((e) => !e.tusc_approved);
  const approved = eventStats.filter((e) => e.tusc_approved);

  const StatusBadge = ({ label, isApproved }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${isApproved
          ? "bg-green-100 text-green-700 dark:bg-green-600/80 dark:text-green-100 border border-green-300 dark:border-green-500"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-600/80 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-500"
        }`}
    >
      {isApproved ? <CheckCircle size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
      {label}: {isApproved ? "Approved" : "Pending"}
    </span>
  );

  const EventItemCard = ({ event, index, isPendingList }) => (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:border-gray-600 transition-all duration-300"
    >
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{event.name}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
        <CalendarDays size={14} className="mr-2 text-indigo-500 dark:text-indigo-400" />
        {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}
      </p>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 line-clamp-2">{event.description}</p>
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mb-3">
        <p className="flex items-center"><Settings2 size={12} className="mr-1.5 text-gray-400 dark:text-gray-500" />Type: <span className="font-medium capitalize ml-1">{event.type}</span></p>
        <p className="flex items-center">
            {event.event_mode === 'team' ? <Users size={12} className="mr-1.5 text-gray-400 dark:text-gray-500"/> : <User size={12} className="mr-1.5 text-gray-400 dark:text-gray-500"/>}
            Mode: <span className="font-medium capitalize ml-1">{event.event_mode}</span>
        </p>
        {event.event_mode === 'team' && event.max_team_members && (
          <p className="flex items-center"><Users size={12} className="mr-1.5 text-gray-400 dark:text-gray-500"/>Max Members: <span className="font-medium ml-1">{event.max_team_members}</span></p>
        )}
      </div>

      <div className="mb-4">
        <StatusBadge label="TUSC Status" isApproved={event.tusc_approved} />
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-2 justify-end">
        {isPendingList && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => handleApprove(event.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center shadow-sm"
          >
            <CheckCircle size={14} className="mr-1" /> Approve
          </motion.button>
        )}
        {!isPendingList && (
             <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleReject(event.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center shadow-sm"
            >
                <XCircle size={14} className="mr-1" /> Un-approve
            </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleEdit(event)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center shadow-sm"
        >
          <Edit3 size={14} className="mr-1" /> Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleDelete(event.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center shadow-sm"
        >
          <Trash2 size={14} className="mr-1" /> Delete
        </motion.button>
      </div>
    </motion.div>
  );


  // MAIN JSX RETURN
  return (
    <div className={`flex flex-col min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-200`}>
      <Topbar toggleTheme={toggleTheme} currentTheme={theme} handleLogout={handleLogout} />

      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }}
            className={`fixed top-20 right-5 z-[100] p-4 rounded-lg shadow-xl text-white flex items-center space-x-2
                        ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(n => ({ ...n, show: false }))} className="ml-auto p-1 rounded-full hover:bg-white/20">
              <XCircle size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar - Black Theme */}
        <aside className="bg-gray-900 text-gray-300 w-64 flex-shrink-0 flex flex-col p-4 shadow-2xl">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
                <ShieldCheck size={24} className="mr-2 text-indigo-400"/> TUSC Portal
            </h3>
          </div>

          <nav className="flex-grow space-y-2.5">
            <motion.button
              whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(79, 70, 229, 0.7)" /* indigo-600 with opacity */ }} // More subtle hover
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowCreateForm(prev => !prev); setEditingEvent(null); }}
              className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200 shadow-md"
            >
              <PlusCircle size={18} /> <span>{showCreateForm && !editingEvent ? "Close Form" : "Create Event"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(124, 58, 237, 0.7)" /* purple-600 with opacity */}}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEventSection(prev => !prev)}
              className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors duration-200 shadow-md"
            >
              <Eye size={18} /> <span>{showEventSection ? "Hide Events" : "View Events"}</span>
            </motion.button>

            <Link to="/participants">
              <motion.button
                whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(13, 148, 136, 0.7)" /* teal-600 with opacity */}}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-500 transition-colors duration-200 shadow-md"
              >
                <ListChecks size={18} /> <span>Manage Participants</span>
              </motion.button>
            </Link>
             <motion.button
                whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(6, 182, 212, 0.7)" /* cyan-600 with opacity */}}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReviewClick()}
                className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-500 transition-colors duration-200 shadow-md"
            >
                <Eye size={18} /> <span>Review Results (Test)</span>
            </motion.button>
          </nav>

          <div className="mt-auto border-t border-gray-700 pt-4">
            {/* Logout button is now in Topbar, this space can be used for other links or info if needed */}
            <p className="text-xs text-gray-500 text-center">© {new Date().getFullYear()} IHTMS</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <motion.div variants={pageContainerVariants} initial="hidden" animate="visible">

            <AnimatePresence>
            {showReview && selectedEventIdForReview && (
                <motion.div
                    key="review-section"
                    variants={formVariants}
                    initial="hidden" animate="visible" exit="exit"
                    className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Event Result Review</h3>
                    <EventResultReview eventId={selectedEventIdForReview} />
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowReview(false)}
                        className="mt-4 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm"
                    >
                        Close Review
                    </motion.button>
                </motion.div>
            )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {editingEvent ? (
                <motion.form
                  key="edit-form"
                  variants={formVariants} initial="hidden" animate="visible" exit="exit"
                  onSubmit={handleUpdateSubmit}
                  className="space-y-5 mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Edit Event</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Name</label>
                    <input type="text" name="name" value={updatedEventData.name} onChange={handleUpdateInputChange} required className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea name="description" value={updatedEventData.description} onChange={handleUpdateInputChange} required rows="3" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input type="date" name="event_date" value={updatedEventData.event_date} onChange={handleUpdateInputChange} required className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100" style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}/>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-60 flex items-center">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2"/> : <CheckCircle size={18} className="mr-2"/>} Update
                    </motion.button>
                    <motion.button type="button" onClick={() => setEditingEvent(null)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium">Cancel</motion.button>
                  </div>
                </motion.form>
              ) : showCreateForm && (
                <motion.form
                  key="create-form"
                  variants={formVariants} initial="hidden" animate="visible" exit="exit"
                  onSubmit={handleEventSubmit}
                  className="space-y-5 mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Create New Event</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Name</label>
                    <input type="text" name="name" value={eventData.name} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"/>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea name="description" value={eventData.description} onChange={handleInputChange} required rows="3" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input type="date" name="event_date" value={eventData.event_date} onChange={handleInputChange} required className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100" style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select name="type" value={eventData.type} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100">
                            <option value="sports">Sports</option>
                            <option value="cultural">Cultural</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
                        <select name="event_mode" value={eventData.event_mode} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100">
                            <option value="solo">Solo</option>
                            <option value="team">Team</option>
                        </select>
                    </div>
                  </div>
                   {eventData.event_mode === "team" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Team Members</label>
                        <input type="number" name="max_team_members" value={eventData.max_team_members} onChange={handleInputChange} min={1} required={eventData.event_mode === "team"} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"/>
                    </motion.div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-60 flex items-center">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2"/> : <PlusCircle size={18} className="mr-2"/>} Create
                    </motion.button>
                    <motion.button type="button" onClick={() => setShowCreateForm(false)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium">Cancel</motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>


            {showEventSection && (
              <motion.div variants={pageContainerVariants} initial="hidden" animate="visible" className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white w-full sm:w-auto mb-2 sm:mb-0">Event Approvals</h3>
                  <motion.button
                    onClick={() => setViewMode("pending")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors
                      ${viewMode === "pending" ? "bg-indigo-600 text-white dark:bg-indigo-500" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`}
                  >
                    <AlertTriangle size={16}/><span>Pending ({pending.length})</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("approved")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors
                      ${viewMode === "approved" ? "bg-green-600 text-white dark:bg-green-500" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`}
                  >
                    <CheckCircle size={16}/><span>Approved ({approved.length})</span>
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {viewMode === "pending" && (
                    <motion.div key="pending-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {pending.length > 0 ? pending.map((event, index) => (
                        <EventItemCard key={event.id} event={event} index={index} isPendingList={true} />
                      )) : (
                        <motion.p variants={itemVariants} initial="hidden" animate="visible" className="md:col-span-2 xl:col-span-3 text-center text-gray-500 dark:text-gray-400 py-8 flex flex-col items-center">
                            <FileText size={32} className="mb-2 text-gray-400 dark:text-gray-500"/> No pending events.
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                  {viewMode === "approved" && (
                    <motion.div key="approved-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {approved.length > 0 ? approved.map((event, index) => (
                        <EventItemCard key={event.id} event={event} index={index} isPendingList={false} />
                      )) : (
                         <motion.p variants={itemVariants} initial="hidden" animate="visible" className="md:col-span-2 xl:col-span-3 text-center text-gray-500 dark:text-gray-400 py-8 flex flex-col items-center">
                            <FileText size={32} className="mb-2 text-gray-400 dark:text-gray-500"/> No approved events.
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardTUSC;