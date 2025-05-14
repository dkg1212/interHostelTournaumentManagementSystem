/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar"; // No longer using separate Sidebar component for this specific layout
import Topbar from "../components/Toopbar"; // Corrected typo from Toopbar, and assuming it's just Topbar
import EventResultReview from "./EventResultReview"; // Added for DSW, adjust path as needed
import {
  fetchEventStats,
  approveEntry,
  rejectEntry,
  updateEvent,
} from "../services/eventService";
import {
  CheckCircle,
  XCircle,
  Edit3,
  CalendarClock, // DSW's choice, fine
  FileText,     // Standardized to FileText like TUSC
  Eye,
  ListFilter,   // DSW's choice, fine
  AlertTriangle,
  PlusCircle,   // Not used in DSW sidebar for create, but kept for other potential uses
  Loader2,
  ShieldCheck,
  ListChecks,   // For Manage Participants like TUSC
  // Menu // No longer needed for Topbar as sidebar is fixed
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

// Animation Variants (consistent with TUSC and DSW needs)
const formVariants = { // For inline appearing sections like Review
  hidden: { opacity: 0, y: -30, height: 0, overflow: 'hidden' },
  visible: { opacity: 1, y: 0, height: 'auto', overflow: 'visible', transition: { duration: 0.4, ease: "circOut" } },
  exit: { opacity: 0, y: -30, height: 0, overflow: 'hidden', transition: { duration: 0.3, ease: "circIn" } },
};

const itemVariants = { // For list items like EventCard
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeIn" } },
};

const pageContainerVariants = { // For main sections
  hidden: { opacity: 0, y:10 }, // Subtle y animation
  visible: { opacity: 1, y:0, transition: { duration: 0.5, ease: "easeOut" } },
};

const modalFormVariants = { // For Edit Event Modal
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2, ease: "easeIn" } },
};


const DashboardDSW = () => {
  const [eventStats, setEventStats] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [activeViewFilter, setActiveViewFilter] = useState('pending'); // 'pending', 'approved', 'all'

  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedEventData, setUpdatedEventData] = useState({
    name: "",
    description: "",
    event_date: "",
  });
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const navigate = useNavigate();

  // States for TUSC-like features
  const [showEventSection, setShowEventSection] = useState(true); // To toggle event list visibility
  const [showReview, setShowReview] = useState(false);
  const [selectedEventIdForReview, setSelectedEventIdForReview] = useState(null);


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
    setTimeout(() => {
      setNotification(n => ({ ...n, show: false }));
    }, duration);
  };

  const loadEvents = async () => {
    try {
      const res = await fetchEventStats();
      setEventStats(res.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      showAppNotification("Failed to fetch events.", "error");
    }
  };

  useEffect(() => {
    // Load events when the event section is shown or filter changes, similar to TUSC
    // Or just load once if that's preferred for DSW and rely on client-side filtering for activeViewFilter
    if (showEventSection) {
        loadEvents();
    }
  }, [showEventSection]); // Load once on mount if showEventSection is default true

  const handleApprove = async (id) => {
    try {
      await approveEntry(id); // This service call should handle DSW approval
      await loadEvents();
      showAppNotification("Event approved successfully by DSW!", "success");
    } catch (error) {
      showAppNotification("Failed to approve event.", "error");
    }
  };

  const handleReject = async (id) => { // Or "Un-approve"
    try {
      await rejectEntry(id); // This service call should handle DSW rejection/un-approval
      await loadEvents();
      showAppNotification("Event action successful by DSW!", "success");
    } catch (error) {
      showAppNotification("Failed to perform action on event.", "error");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setUpdatedEventData({
      name: event.name,
      description: event.description,
      event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : "",
    });
     window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top if modal is not used or for inline form
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;
    setIsSubmittingUpdate(true);
    try {
      await updateEvent(editingEvent.id, updatedEventData);
      setEditingEvent(null);
      loadEvents();
      showAppNotification("Event updated successfully!", "success");
    } catch (err) {
      showAppNotification(err.response?.data?.message || "Error updating event.", "error");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // DSW might use 'token'
    localStorage.removeItem("userId"); // DSW might use 'userId'
    localStorage.removeItem("role");   // DSW might use 'role'
    localStorage.removeItem("theme");
    navigate("/login");
  };

  // For EventResultReview section toggle
  const handleReviewClick = (eventId) => {
    setSelectedEventIdForReview(eventId || null); // Pass null if EventResultReview has its own selector
    setShowReview(true);
    setShowEventSection(false); // Optionally hide other sections
  };

  const pendingByDSW = eventStats.filter((e) => !e.dsw_approved);
  const approvedByDSW = eventStats.filter((e) => e.dsw_approved);
  const allEvents = eventStats;


  const StatusBadge = ({ label, isApproved, specificStatus }) => (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap
        ${isApproved
          ? "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300 border border-green-300 dark:border-green-600"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-600"
        }`}
    >
      {isApproved ? <CheckCircle size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
      {label}: {specificStatus}
    </span>
  );

  const EventCard = ({ event, index, onApprove, onRejectOrUnapprove, onEdit, isDSWPendingCard }) => (
    <motion.div 
      custom={index}
      variants={itemVariants} // Using itemVariants for staggered animation
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:border-gray-600 transition-all duration-300 flex flex-col"
    >
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">{event.name}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
        <CalendarClock size={14} className="mr-1.5 text-indigo-500 dark:text-indigo-400" />
        {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}
      </p>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3 flex-grow">{event.description}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        <StatusBadge label="DSW" isApproved={event.dsw_approved} specificStatus={event.dsw_approved ? "Approved" : "Pending"} />
        <StatusBadge label="TUSC" isApproved={event.tusc_approved} specificStatus={event.tusc_approved ? "Approved" : "Pending"}/>
      </div>
      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-2 justify-end">
        {isDSWPendingCard && event.tusc_approved && ( // DSW can only approve if TUSC has approved
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onApprove(event.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center shadow-sm" >
            <CheckCircle size={14} className="mr-1.5" /> Approve (DSW)
          </motion.button>
        )}
         {isDSWPendingCard && !event.tusc_approved && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400 p-1.5 rounded-md border border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-700/20">
            Awaiting TUSC Approval
          </span>
        )}
        <motion.button // Reject for pending, Un-approve for approved
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => onRejectOrUnapprove(event.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center shadow-sm" >
          <XCircle size={14} className="mr-1.5" /> 
          {isDSWPendingCard ? 'Reject (DSW)' : 'Un-approve (DSW)'}
        </motion.button>
        <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(event)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center shadow-sm" >
            <Edit3 size={14} className="mr-1.5" /> Edit
        </motion.button>
      </div>
    </motion.div>
  );

  const NotificationDisplay = () => ( // Same as TUSC
    <AnimatePresence>
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }}
          className={`fixed top-20 right-5 z-[100] p-4 rounded-lg shadow-xl text-white flex items-center space-x-2
                      ${notification.type === 'success' ? 'bg-green-500' : 
                        notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} >
          {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(n => ({ ...n, show: false }))} className="ml-auto p-1 rounded-full hover:bg-white/20">
            <XCircle size={18}/>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Determine which list of events to show
  let eventsToDisplay = [];
  if (activeViewFilter === 'pending') eventsToDisplay = pendingByDSW;
  else if (activeViewFilter === 'approved') eventsToDisplay = approvedByDSW;
  else if (activeViewFilter === 'all') eventsToDisplay = allEvents;


  return (
    <div className={`flex flex-col min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-gray-200`}>
      <NotificationDisplay />
      <Topbar
          currentTheme={theme}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
      />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* pt-16 for Topbar height */}
        {/* Sidebar - Styled like TUSC */}
        <aside className="bg-gray-900 text-gray-300 w-64 flex-shrink-0 flex flex-col p-4 shadow-2xl">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                    <ShieldCheck size={24} className="mr-2 text-indigo-400"/> DSW Portal
                </h3>
            </div>
            <nav className="flex-grow space-y-2.5">
                <motion.button
                    whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(79, 70, 229, 0.7)"}}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setShowEventSection(prev => !prev); setShowReview(false); }}
                    className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200 shadow-md"
                >
                    <Eye size={18} /> <span>{showEventSection ? "Hide Approvals" : "View Approvals"}</span>
                </motion.button>
                <Link to="/participants">
                    <motion.button
                        whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(13, 148, 136, 0.7)"}}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-500 transition-colors duration-200 shadow-md"
                    >
                        <ListChecks size={18} /> <span>Manage Participants</span>
                    </motion.button>
                </Link>
                <motion.button
                    whileHover={{ scale: 1.02, x: 2, backgroundColor: "rgba(6, 182, 212, 0.7)"}}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { handleReviewClick(); setShowEventSection(false); }}
                    className="w-full flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-500 transition-colors duration-200 shadow-md"
                >
                    <Eye size={18} /> <span>Review Results</span>
                </motion.button>
            </nav>
            <div className="mt-auto border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-500 text-center">© {new Date().getFullYear()} IHTMS-DSW</p>
            </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <motion.div variants={pageContainerVariants} initial="hidden" animate="visible">
            
            <AnimatePresence>
                {showReview && ( // Render EventResultReview similar to TUSC
                    <motion.div
                        key="review-section-dsw"
                        variants={formVariants} // Using TUSC's formVariants for this section
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

            {showEventSection && (
              <motion.div 
                  variants={pageContainerVariants} initial="hidden" animate="visible" // Main section container
                  className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl" >
                <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white w-full sm:w-auto mb-2 sm:mb-0">DSW Event Approvals</h3>
                    <motion.button
                        onClick={() => setActiveViewFilter('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors
                            ${activeViewFilter === 'pending' ? "bg-indigo-600 text-white dark:bg-indigo-500" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`} >
                        <AlertTriangle size={16}/><span>Pending DSW ({pendingByDSW.length})</span>
                    </motion.button>
                    <motion.button
                        onClick={() => setActiveViewFilter('approved')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors
                            ${activeViewFilter === 'approved' ? "bg-green-600 text-white dark:bg-green-500" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`} >
                        <CheckCircle size={16}/><span>Approved DSW ({approvedByDSW.length})</span>
                    </motion.button>
                    <motion.button
                        onClick={() => setActiveViewFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors
                            ${activeViewFilter === 'all' ? "bg-blue-600 text-white dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`} >
                        <ListFilter size={16}/><span>All Events ({allEvents.length})</span>
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeViewFilter} // Re-render when filter changes
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
                  >
                    {eventsToDisplay.length > 0 ? eventsToDisplay.map((event, index) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        index={index}
                        onApprove={handleApprove}
                        onRejectOrUnapprove={handleReject}
                        onEdit={handleEdit}
                        isDSWPendingCard={!event.dsw_approved} // True if DSW has not approved
                      />
                    )) : (
                      <motion.p 
                        variants={itemVariants} initial="hidden" animate="visible"
                        className="md:col-span-2 xl:col-span-3 text-center text-gray-500 dark:text-gray-400 py-8 flex flex-col items-center">
                          <FileText size={32} className="mb-2 text-gray-400 dark:text-gray-500"/>
                          No events found for this filter.
                      </motion.p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* Edit Event Modal (kept from original DSW structure) */}
            <AnimatePresence>
            {editingEvent && (
              <motion.div
                key="edit-modal-dsw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black/60 dark:bg-black/80 z-50 p-4"
                onClick={() => setEditingEvent(null)} >
                <motion.div
                  variants={modalFormVariants} initial="initial" animate="animate" exit="exit"
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg"
                  onClick={(e) => e.stopPropagation()} >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Event Details</h3>
                    <button onClick={() => setEditingEvent(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XCircle size={24}/>
                    </button>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4" >
                    <div>
                      <label htmlFor="eventNameEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Name</label>
                      <input id="eventNameEdit" type="text" value={updatedEventData.name}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, name: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"
                        required />
                    </div>
                    <div>
                      <label htmlFor="eventDescriptionEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea id="eventDescriptionEdit" rows={3} value={updatedEventData.description}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, description: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"
                        required />
                    </div>
                    <div>
                      <label htmlFor="eventDateEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Date</label>
                      <input id="eventDateEdit" type="date" value={updatedEventData.event_date}
                        onChange={(e) => setUpdatedEventData({ ...updatedEventData, event_date: e.target.value })}
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-gray-800 dark:text-gray-100"
                        style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                        required />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <motion.button type="button" onClick={() => setEditingEvent(null)}
                        whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors" >
                        Cancel
                      </motion.button>
                      <motion.button type="submit" disabled={isSubmittingUpdate}
                        whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-60 flex items-center" >
                        {isSubmittingUpdate ? <Loader2 size={16} className="animate-spin mr-2"/> : <CheckCircle size={16} className="mr-2"/>}
                        Update Event
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardDSW;