/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Assuming this is styled similarly to the new Layout's sidebar
import Topbar from "../components/Toopbar";   // Assuming this is styled similarly to the new Layout's topbar
import {
  fetchEventStats,
  approveEntry,
  rejectEntry,
  updateEvent,
} from "../services/eventService";
import {
  CheckCircle, // Lucide icon for Approve
  XCircle,     // Lucide icon for Reject
  Edit3,       // Lucide icon for Edit
  CalendarClock, // Lucide icon for event date
  FileText,    // Lucide icon for description
  Eye,         // Lucide icon for Review Results
  ListFilter,  // Lucide icon for toggling views
  AlertTriangle, // For error messages
  PlusCircle, // Example for "Create Event" if needed
  ChevronDown, // For dropdown-like toggles if needed
  ChevronUp    // For dropdown-like toggles if needed
} from "lucide-react"; // Import lucide-react icons

const DashboardDSW = () => {
  const [eventStats, setEventStats] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '', show: false }); // For notifications
  const [showPending, setShowPending] = useState(true); // Default to showing pending
  const [showApproved, setShowApproved] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);
  const [updatedEventData, setUpdatedEventData] = useState({
    name: "",
    description: "",
    event_date: "",
  });
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false); // For update button loading state

  const showAppNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(n => ({ ...n, show: false }));
    }, duration);
  };

  const loadEvents = async () => {
    try {
      const res = await fetchEventStats();
      setEventStats(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      showAppNotification("Failed to fetch events.", "error");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveEntry(id);
      await loadEvents();
      showAppNotification("Event approved successfully!", "success");
    } catch (error) {
      showAppNotification("Failed to approve event.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEntry(id);
      await loadEvents();
      showAppNotification("Event rejected successfully!", "success");
    } catch (error) {
      showAppNotification("Failed to reject event.", "error");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setUpdatedEventData({
      name: event.name,
      description: event.description,
      // Ensure date is formatted correctly for input type="date" (YYYY-MM-DD)
      event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : "",
    });
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
      console.error("Error updating event:", err);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const pending = eventStats.filter((e) => !e.dsw_approved);
  const approved = eventStats.filter((e) => e.dsw_approved);

  const StatusBadge = ({ label, isApproved }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${isApproved
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-yellow-100 text-yellow-700 border border-yellow-300" // Changed pending to yellow
        }`}
    >
      {isApproved ? <CheckCircle size={12} className="mr-1" /> : <AlertTriangle size={12} className="mr-1" />}
      {label}
    </span>
  );

  const EventCard = ({ event, onApprove, onReject, onEdit, isPendingCard }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <h4 className="text-lg font-semibold text-gray-800 mb-1">{event.name}</h4>
      <p className="text-sm text-gray-500 mb-3 flex items-center">
        <CalendarClock size={14} className="mr-2 text-indigo-500" />
        {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'}
      </p>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge label="DSW Approved" isApproved={event.dsw_approved} />
        <StatusBadge label="TUSC Approved" isApproved={event.tusc_approved} />
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
        {isPendingCard && (
          <button
            onClick={() => onApprove(event.id)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center transition-colors shadow-sm"
          >
            <CheckCircle size={16} className="mr-1.5" /> Approve
          </button>
        )}
        <button
          onClick={() => onReject(event.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center transition-colors shadow-sm"
        >
          <XCircle size={16} className="mr-1.5" /> Reject
        </button>
        {isPendingCard && (
          <button
            onClick={() => onEdit(event)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center transition-colors shadow-sm"
          >
            <Edit3 size={16} className="mr-1.5" /> Edit
          </button>
        )}
      </div>
    </div>
  );


  return (
    <div className="flex h-screen bg-gray-100"> {/* Assuming Layout provides this structure */}
      <Sidebar role="dsw" /> {/* Ensure this Sidebar matches the new Layout style */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar /> {/* Ensure this Topbar matches the new Layout style */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto"> {/* Consistent container */}

          {/* Notification Area (similar to Participants.jsx) */}
          {notification.show && (
            <div className={`fixed top-20 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-2 mb-4
                            ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
              {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
              <span>{notification.message}</span>
              <button onClick={() => setNotification(n => ({ ...n, show: false }))} className="ml-auto p-1 rounded-full hover:bg-white/20">
                <XCircle size={18}/>
              </button>
            </div>
          )}

            <header className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">DSW Dashboard</h2>
            </header>

            <div className="mb-8 p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/participants">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all text-sm font-medium flex items-center">
                    <Eye size={18} className="mr-2" /> Review Results
                  </button>
                </Link>
                {/* Add other quick actions here if needed */}
              </div>
            </div>


            <div className="mb-6 p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <ListFilter size={22} className="mr-2 text-indigo-600" /> Event Views
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {setShowPending(true); setShowApproved(false);}}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${showPending && !showApproved
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  <AlertTriangle size={16} /> <span>Pending ({pending.length})</span>
                </button>
                <button
                  onClick={() => {setShowApproved(true); setShowPending(false);}}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${showApproved && !showPending
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                   <CheckCircle size={16} /> <span>Approved ({approved.length})</span>
                </button>
                 <button
                  onClick={() => {setShowPending(true); setShowApproved(true);}}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2
                    ${showApproved && showPending
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                   <ListFilter size={16} /> <span>Show All</span>
                </button>
              </div>
            </div>


            {/* Pending Events Section */}
            {showPending && (
              <section className="mb-10">
                <h3 className="text-2xl font-semibold text-gray-700 mb-5">Pending Events</h3>
                {pending.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pending.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onEdit={handleEdit}
                        isPendingCard={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No pending events to review at the moment.</p>
                  </div>
                )}
              </section>
            )}

            {/* Approved Events Section */}
            {showApproved && (
              <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-5">Approved Events</h3>
                {approved.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approved.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onReject={handleReject}
                        isPendingCard={false} // No approve/edit for already approved
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No events have been approved yet.</p>
                  </div>
                )}
              </section>
            )}

            {/* Edit Event Modal */}
            {editingEvent && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Edit Event Details</h3>
                    <button onClick={() => setEditingEvent(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24}/>
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate();
                    }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                        <input
                          id="eventName"
                          type="text"
                          value={updatedEventData.name}
                          onChange={(e) =>
                            setUpdatedEventData({ ...updatedEventData, name: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          id="eventDescription"
                          rows={4}
                          value={updatedEventData.description}
                          onChange={(e) =>
                            setUpdatedEventData({ ...updatedEventData, description: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                        <input
                          id="eventDate"
                          type="date"
                          value={updatedEventData.event_date}
                          onChange={(e) =>
                            setUpdatedEventData({ ...updatedEventData, event_date: e.target.value })
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditingEvent(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingUpdate}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                      >
                        {isSubmittingUpdate ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                            </span>
                        ) : "Update Event"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardDSW;