/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import React, { useEffect, useState } from 'react';
import {
  getApprovedEvents,
  fetchEventResults,
  updateEventScores,
} from "../services/eventService";
import {
  ListChecks,     // For main title
  CalendarCheck2, // For event card title
  Eye,            // For "Review Result" button
  ChevronDown,    // To indicate expandable section (closed)
  ChevronUp,      // To indicate expandable section (open)
  Save,           // For Update button
  Loader2,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCircle2,
  Award,
  Star,
  Settings2,      // Event Type
  Users,          // Event Mode (Team)
  User,           // Event Mode (Solo)
  CalendarDays,   // Event Date
  FileText,       // Event Description
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation Variants
const pageContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: (i) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: i * 0.05 },
  }),
  exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.3, ease: "easeIn" } }
};

const resultsSectionVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, overflow: 'hidden' },
  visible: { opacity: 1, height: 'auto', marginTop: '1rem', transition: { duration: 0.4, ease: "circOut" } },
  exit: { opacity: 0, height: 0, marginTop: 0, overflow: 'hidden', transition: { duration: 0.3, ease: "circIn" } },
};

const POSITION_OPTIONS = [
  '1st', '2nd', '3rd', 'participant', 'Honorable Mention', 'Disqualified',
];

const EventResultReview = () => {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null); // ID of event whose results are shown
  const [eventResults, setEventResults] = useState([]); // Ensure it's an array
  const [loadingResultsForEvent, setLoadingResultsForEvent] = useState(null); // Store eventId being loaded
  const [editedScores, setEditedScores] = useState({});
  const [editedPositions, setEditedPositions] = useState({});
  const [updatingParticipantId, setUpdatingParticipantId] = useState(null); // participant.user_id
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  const showAppNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, show: true });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), duration);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const data = await getApprovedEvents();
        setApprovedEvents(data || []);
      } catch (error) {
        console.error("Error loading approved events:", error);
        showAppNotification(error.message || "Failed to load approved events.", "error");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const handleToggleReviewResults = async (eventId) => {
    if (selectedEventId === eventId) {
      setSelectedEventId(null); // Collapse if already selected
      setEventResults([]);
      return;
    }

    setSelectedEventId(eventId);
    setLoadingResultsForEvent(eventId);
    setEventResults([]); // Clear previous results
    setEditedScores({}); // Clear edits
    setEditedPositions({});
    try {
      const resultsData = await fetchEventResults(eventId);
      if (resultsData.success && Array.isArray(resultsData.results)) {
        setEventResults(resultsData.results);
      } else {
        setEventResults([]); // Ensure it's an array even on failure
        showAppNotification(resultsData.message || "Failed to fetch results for this event.", "error");
      }
    } catch (error) {
      console.error("Error fetching event results:", error);
      showAppNotification(error.message || "Error fetching event results.", "error");
      setEventResults([]);
    } finally {
      setLoadingResultsForEvent(null);
    }
  };

  const handleScoreChange = (participantId, newScore) => {
    setEditedScores((prev) => ({ ...prev, [participantId]: newScore }));
  };

  const handlePositionChange = (participantId, newPosition) => {
    setEditedPositions((prev) => ({ ...prev, [participantId]: newPosition }));
  };

  const handleUpdateSingleParticipant = async (participantId) => {
    const currentEvent = approvedEvents.find(e => e.id === selectedEventId);
    if (!currentEvent) return;

    // Use edited value if present, otherwise use original value from eventResults
    const originalParticipantData = eventResults.find(p => p.user_id === participantId);
    if (!originalParticipantData) {
        showAppNotification("Participant data not found.", "error");
        return;
    }
    
    const scoreToUpdate = editedScores.hasOwnProperty(participantId) ? editedScores[participantId] : originalParticipantData.score;
    const positionToUpdate = editedPositions.hasOwnProperty(participantId) ? editedPositions[participantId] : originalParticipantData.position;

    if (scoreToUpdate === undefined || scoreToUpdate === "" || positionToUpdate === undefined || positionToUpdate === "") {
      showAppNotification("Please ensure both score and position are set.", "error");
      return;
    }
    
    setUpdatingParticipantId(participantId);
    try {
      const res = await updateEventScores(currentEvent.id, participantId, scoreToUpdate, positionToUpdate);
      if (res.success) {
        showAppNotification("Score and position updated successfully!", "success");
        // Refresh results for the current event
        const updatedResultsData = await fetchEventResults(currentEvent.id);
        if (updatedResultsData.success && Array.isArray(updatedResultsData.results)) {
            setEventResults(updatedResultsData.results);
        }
        setEditedScores(prev => ({...prev, [participantId]: undefined})); // Clear specific edit
        setEditedPositions(prev => ({...prev, [participantId]: undefined}));
      } else {
        showAppNotification(res.message || "Failed to update score and position.", "error");
      }
    } catch (error) {
      console.error("Error updating score and position:", error);
      showAppNotification(error.message || "Update failed.", "error");
    } finally {
      setUpdatingParticipantId(null);
    }
  };

  const NotificationDisplay = () => (
    <AnimatePresence>
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className={`fixed top-20 right-5 z-[100] p-4 rounded-lg shadow-xl text-white flex items-center space-x-2
                      ${notification.type === 'success' ? 'bg-green-500' : 
                        notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {notification.type === 'success' ? <CheckCircle size={24} /> : 
           notification.type === 'error' ? <AlertTriangle size={24} /> : <Info size={24} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(n => ({ ...n, show: false }))} className="ml-auto p-1 rounded-full hover:bg-white/20">
            <XCircle size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loadingEvents) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 size={48} className="animate-spin text-indigo-500 dark:text-indigo-400" />
        <p className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading approved events...</p>
      </div>
    );
  }
  
  const EventDetailItem = ({ icon: Icon, label, value, iconColorClass = "text-gray-500 dark:text-gray-400" }) => (
    <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5 flex items-start">
      <Icon size={12} className={`mr-1.5 mt-0.5 flex-shrink-0 ${iconColorClass}`} />
      <strong className="font-medium text-gray-700 dark:text-gray-300 w-20">{label}:</strong>
      <span className="flex-1 capitalize">{value}</span>
    </p>
  );


  return (
    <motion.div 
      variants={pageContainerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-6"
    >
      <NotificationDisplay />
      <header className="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <ListChecks size={32} className="mr-3 text-indigo-600 dark:text-indigo-400" />
          Review Event Results
        </h1>
      </header>

      {approvedEvents.length === 0 && !loadingEvents ? (
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
        >
          <Info size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg text-gray-600 dark:text-gray-400">No approved events to review.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <AnimatePresence>
            {approvedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                custom={index}
                variants={cardVariants}
                initial="hidden" animate="visible" exit="exit"
                layout // Animates layout changes when results section expands/collapses
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 flex flex-col hover:shadow-2xl dark:hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-1 line-clamp-2">{event.name}</h3>
                        <EventDetailItem icon={Settings2} label="Type" value={event.type} />
                        <EventDetailItem icon={CalendarDays} label="Date" value={new Date(event.event_date).toLocaleDateString()} />
                        <EventDetailItem icon={event.event_mode === 'team' ? Users : User} label="Mode" value={event.event_mode} />
                    </div>
                    <motion.button
                        onClick={() => handleToggleReviewResults(event.id)}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-expanded={selectedEventId === event.id}
                        whileTap={{scale:0.9}}
                    >
                        {selectedEventId === event.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </motion.button>
                </div>

                <AnimatePresence>
                  {selectedEventId === event.id && (
                    <motion.div
                      key={`results-${event.id}`}
                      variants={resultsSectionVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50"
                    >
                      {loadingResultsForEvent === event.id ? (
                        <div className="flex justify-center items-center py-4">
                          <Loader2 size={24} className="animate-spin text-indigo-500 dark:text-indigo-400" />
                          <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading results...</p>
                        </div>
                      ) : eventResults.length > 0 ? (
                        <>
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Participants & Results:</h5>
                          <ul className="space-y-3 max-h-60 overflow-y-auto pr-1"> {/* Scrollable participant list */}
                            {eventResults.map((participant) => (
                              <li
                                key={participant.user_id}
                                className="flex flex-col sm:flex-row justify-between sm:items-center text-sm p-2.5 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                              >
                                <div className="mb-2 sm:mb-0">
                                  <p className="font-medium text-gray-800 dark:text-gray-100 flex items-center">
                                    <UserCircle2 size={16} className="mr-1.5 text-gray-500 dark:text-gray-400"/>
                                    {participant.user_name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                                    Current: Score {participant.score}, Position: {participant.position}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                  <input
                                    type="number"
                                    min="0" max="100"
                                    aria-label={`Score for ${participant.user_name}`}
                                    className="p-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md w-20 text-xs text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={editedScores[participant.user_id] ?? participant.score ?? ''}
                                    onChange={(e) => handleScoreChange(participant.user_id, e.target.value)}
                                  />
                                  <select
                                    aria-label={`Position for ${participant.user_name}`}
                                    className="p-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md text-xs text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500 outline-none min-w-[120px]"
                                    value={editedPositions[participant.user_id] ?? participant.position ?? 'participant'}
                                    onChange={(e) => handlePositionChange(participant.user_id, e.target.value)}
                                  >
                                    {POSITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleUpdateSingleParticipant(participant.user_id)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-md text-xs flex items-center shadow-sm disabled:opacity-60"
                                    disabled={updatingParticipantId === participant.user_id}
                                  >
                                    {updatingParticipantId === participant.user_id ? (
                                      <Loader2 size={14} className="animate-spin mr-1" />
                                    ) : (
                                      <Save size={14} className="mr-1" />
                                    )}
                                    Update
                                  </motion.button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                         <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No results found for this event yet.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default EventResultReview;