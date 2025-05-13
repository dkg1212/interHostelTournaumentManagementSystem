/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { getApprovedEvents, registerForEvent } from "../services/eventService";
// Removed Link, useLocation, and Topbar imports assuming they are handled by a parent Layout
import {
  CalendarCheck2, // For Approved Events title
  ClipboardCheck, // For Register button
  CheckCircle as RegisteredIcon, // For "Registered" status
  Info,           // For "No events found"
  Loader2,
  AlertTriangle,
  CheckCircle,    // For success notification
  XCircle,        // For closing notification
  CalendarDays,   // For event date
  Settings2,      // For event type
  Users,          // For event mode (team)
  User,           // For event mode (solo)
  FileText,       // For description
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants
const pageContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: (i) => ({ // Stagger children
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: i * 0.05 },
  }),
  exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.3, ease: "easeIn" } }
};


const ApprovedEvents = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [isRegistering, setIsRegistering] = useState(null); // Store eventId being registered

  const showAppNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), duration);
  };

  const loadEvents = async () => {
    setLoading(true); // Set loading true when re-fetching
    try {
      const data = await getApprovedEvents(); // Assuming this service fetches events and their registration status
      setApprovedEvents(data || []); // Ensure it's an array
    } catch (error) {
      console.error("Failed to load approved events", error);
      showAppNotification(error.message || "Failed to load approved events.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId, eventName) => {
    const confirmRegister = window.confirm(`Are you sure you want to register for "${eventName}"?`);
    if (!confirmRegister) return;

    setIsRegistering(eventId);
    try {
      await registerForEvent(eventId, eventName); // eventName might not be needed if backend handles it
      showAppNotification(`Successfully registered for "${eventName}"!`, "success");
      loadEvents(); // Reload to update "Registered" status
    } catch (error) {
      if (error.response?.data?.message === "User already registered for this event") {
        showAppNotification("You are already registered for this event!", "info"); // Use 'info' type
      } else {
        console.error("Error registering for event", error);
        showAppNotification(error.response?.data?.message || "Failed to register for the event.", "error");
      }
    } finally {
        setIsRegistering(null);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
                        notification.type === 'error' ? 'bg-red-500' : 
                        notification.type === 'info' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          {notification.type === 'success' ? <CheckCircle size={24} /> : 
           notification.type === 'error' ? <AlertTriangle size={24} /> : 
           notification.type === 'info' ? <Info size={24} /> : <Info size={24} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(n => ({ ...n, show: false }))} className="ml-auto p-1 rounded-full hover:bg-white/20">
            <XCircle size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading && approvedEvents.length === 0) { // Show loader only if no events are displayed yet
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]"> {/* Adjust height */}
        <Loader2 size={48} className="animate-spin text-indigo-500 dark:text-indigo-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading approved events...</p>
      </div>
    );
  }
  
  const EventDetailItem = ({ icon: Icon, label, value, iconColorClass = "text-indigo-500 dark:text-indigo-400" }) => (
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-start">
      <Icon size={14} className={`mr-2 mt-0.5 flex-shrink-0 ${iconColorClass}`} />
      <strong className="font-medium text-gray-700 dark:text-gray-300 w-24">{label}:</strong>
      <span className="flex-1">{value}</span>
    </p>
  );


  return (
    // This component assumes it's rendered within an AppLayout
    <motion.div 
      variants={pageContainerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-6" // Main padding handled by AppLayout's <main>
    >
      <NotificationDisplay />

      <header className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <CalendarCheck2 size={32} className="mr-3 text-green-600 dark:text-green-400" />
          Approved Events
        </h1>
      </header>

      {loading && approvedEvents.length > 0 && ( // Show subtle loading if events are already there but refreshing
        <div className="flex items-center justify-center py-4">
            <Loader2 size={24} className="animate-spin text-indigo-500 dark:text-indigo-400" />
            <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">Refreshing events...</p>
        </div>
      )}

      {!loading && approvedEvents.length === 0 ? (
        <motion.div
          variants={cardVariants} // Can use cardVariants for this message too
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
        >
          <Info size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No approved events are available at the moment.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Please check back later or contact administration for more information.
          </p>
        </motion.div>
      ) : (
        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            // variants={staggerChildrenContainer} // Add if you want staggered children animation on the container
            // initial="hidden"
            // animate="visible"
        >
          <AnimatePresence>
            {approvedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                custom={index} // For stagger delay in cardVariants
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit" // If you remove items dynamically
                layout
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col hover:shadow-2xl dark:hover:border-gray-600 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2 line-clamp-2">{event.name}</h3>
                
                <EventDetailItem icon={Settings2} label="Type" value={event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'N/A'} />
                <EventDetailItem icon={FileText} label="Description" value={event.description || 'No description provided.'} />
                <EventDetailItem icon={CalendarDays} label="Date" value={event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'} />
                <EventDetailItem 
                    icon={event.event_mode === 'team' ? Users : User} 
                    label="Mode" 
                    value={event.event_mode ? event.event_mode.charAt(0).toUpperCase() + event.event_mode.slice(1) : 'N/A'} 
                />
                {event.event_mode === 'team' && event.max_team_members && (
                    <EventDetailItem icon={Users} label="Max Team" value={`${event.max_team_members} members`} />
                )}


                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  {event.isRegistered ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold py-2 px-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                      <RegisteredIcon size={18} /> Registered
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isRegistering === event.id}
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md flex items-center justify-center transition-colors disabled:opacity-60"
                      onClick={() => handleRegister(event.id, event.name)}
                    >
                      {isRegistering === event.id ? (
                        <Loader2 size={18} className="animate-spin mr-2" />
                      ) : (
                        <ClipboardCheck size={18} className="mr-2" />
                      )}
                      {isRegistering === event.id ? 'Registering...' : 'Register'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ApprovedEvents;