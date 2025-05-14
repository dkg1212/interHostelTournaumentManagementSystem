import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, Eye, EyeOff, Filter } from 'lucide-react'; // Added Loader2, Eye, EyeOff, Filter

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For initial page load

  // Granular loading states
  const [isSubmittingSendForm, setIsSubmittingSendForm] = useState(false);
  const [isMarkingAllGlobalInProgress, setIsMarkingAllGlobalInProgress] = useState(false);
  const [itemActionLoading, setItemActionLoading] = useState({}); // { [notifId]: 'deleting' | 'markingRead' }

  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setError("User not logged in. Please log in to see notifications.");
    }
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchNotifications = useCallback(async (isPolling = false) => {
    if (!currentUser) return;
    if (!isPolling) {
      setIsLoading(true);
    }
    // Keep error relevant to the current fetch attempt, clear previous non-fetch related errors
    // setError(''); // Let's clear specific errors instead or let them persist until next action
    const token = getToken();
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      if (!isPolling) setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/notification', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications || []);
        if (!isPolling) setError(''); // Clear fetch error on successful fetch
      } else {
        setError(data.message || 'Failed to fetch notifications.');
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError('An error occurred while fetching notifications.');
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  }, [currentUser]); // currentUser is the main dependency that might change token or relevance

  // Polling and initial fetch
  useEffect(() => {
    if (currentUser) {
      fetchNotifications(); // Initial fetch

      const POLLING_INTERVAL = 30000; // 30 seconds
      const intervalId = setInterval(() => {
        fetchNotifications(true); // Silent poll
      }, POLLING_INTERVAL);

      return () => clearInterval(intervalId);
    } else {
      setNotifications([]); // Clear notifications if user logs out
    }
  }, [currentUser, fetchNotifications]);


  const markAllGlobalAsRead = useCallback(async () => {
    if (!currentUser || (currentUser.role !== 'dsw' && currentUser.role !== 'tusc')) return;

    setIsMarkingAllGlobalInProgress(true);
    setError('');
    setSuccess('');
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      setIsMarkingAllGlobalInProgress(false);
      return;
    }

    try {
      const response = await fetch('/api/notification/mark-all-as-read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || 'All notifications marked as read.');
        fetchNotifications(); // Re-fetch to update all statuses
      } else {
        setError(data.message || 'Failed to mark notifications as read.');
      }
    } catch (err) {
      console.error("Mark as read error:", err);
      setError('An error occurred while marking notifications as read.');
    } finally {
      setIsMarkingAllGlobalInProgress(false);
    }
  }, [currentUser, fetchNotifications]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      setError('Title and message are required to send a notification.');
      return;
    }
    setIsSubmittingSendForm(true);
    setError('');
    setSuccess('');
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      setIsSubmittingSendForm(false);
      return;
    }

    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle, message: newMessage })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || 'Notification sent successfully!');
        setNewTitle('');
        setNewMessage('');
        fetchNotifications(); // Refresh the list
      } else {
        setError(data.message || 'Failed to send notification.');
      }
    } catch (err) {
      console.error("Send notification error:", err);
      setError('An error occurred while sending the notification.');
    } finally {
      setIsSubmittingSendForm(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    setItemActionLoading(prev => ({ ...prev, [notificationId]: 'deleting' }));
    setError('');
    setSuccess('');
    const token = getToken();
    if (!token) {
      setError("Authentication token not found.");
      setItemActionLoading(prev => { const newState = {...prev}; delete newState[notificationId]; return newState; });
      return;
    }

    try {
      const response = await fetch(`/api/notification/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || 'Notification deleted successfully.');
        fetchNotifications(); // Refresh the list
      } else {
        setError(data.message || 'Failed to delete notification.');
      }
    } catch (err) {
      console.error("Delete notification error:", err);
      setError('An error occurred while deleting the notification.');
    } finally {
      setItemActionLoading(prev => {
        const newState = { ...prev };
        delete newState[notificationId];
        return newState;
      });
    }
  };

  const handleMarkIndividualAsRead = async (notificationId) => {
    if (itemActionLoading[notificationId]) return;

    setItemActionLoading(prev => ({ ...prev, [notificationId]: 'markingRead' }));
    setError(''); // Clear general errors
    // Success message is implicit through UI change
    const token = getToken();
    if (!token) {
      setError("Authentication token not found for this action.");
      setItemActionLoading(prev => { const newState = {...prev}; delete newState[notificationId]; return newState; });
      return;
    }

    try {
      // This is a FAKE endpoint for demonstration. Replace with your actual API.
      const response = await fetch(`/api/notification/mark-as-read/${notificationId}`, {
        method: 'POST', // or PUT
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // const data = await response.json(); // Assuming API might return the updated notification or a message

      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        // Optionally, if your Topbar unread count needs manual update, trigger it here
      } else {
        // const errorData = await response.json();
        setError(`Failed to mark notification as read. Server: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Mark individual as read error:", err);
      setError('An error occurred while marking notification as read.');
    } finally {
      setItemActionLoading(prev => {
        const newState = { ...prev };
        delete newState[notificationId];
        return newState;
      });
    }
  };


  const isAdmin = currentUser && (currentUser.role === 'dsw' || currentUser.role === 'tusc');

  const filteredAndSortedNotifications = notifications
    .filter(notif => filter === 'all' || !notif.is_read)
    .sort((a, b) => new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf());

  if (!currentUser && !error) {
    return <p className="text-center text-gray-600 p-8">Loading user information...</p>;
  }
  if (!currentUser && error) { // Typically means "User not logged in" error
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">{error}</div>;
  }

  const anyItemActionInProgress = Object.keys(itemActionLoading).length > 0;
  const globalActionInProgress = isSubmittingSendForm || isMarkingAllGlobalInProgress;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Notifications</h1>

      {isAdmin && (
         <div className="text-center mb-6">
            <button
              onClick={markAllGlobalAsRead}
              disabled={isMarkingAllGlobalInProgress || anyItemActionInProgress}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isMarkingAllGlobalInProgress ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" /> Processing...
                </>
              ) : (
                'Mark All As Read (Global)'
              )}
            </button>
          </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">Success</p>
          <p>{success}</p>
        </div>
      )}

      {isAdmin && (
        <div className="mb-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Send New Notification</h2>
          <form onSubmit={handleSendNotification} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} required rows="4"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
            </div>
            <button type="submit" disabled={isSubmittingSendForm || anyItemActionInProgress || isMarkingAllGlobalInProgress}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmittingSendForm ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" /> Sending...
                </>
              ) : (
                'Send Notification'
              )}
            </button>
          </form>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          {filteredAndSortedNotifications.length > 0 ? 'Received Notifications' : 'No Notifications Yet'}
        </h2>
        <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <button onClick={() => setFilter('all')} disabled={filter === 'all'} className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>All</button>
            <button onClick={() => setFilter('unread')} disabled={filter === 'unread'} className={`px-3 py-1 rounded-md text-sm ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Unread</button>
        </div>
      </div>


      {isLoading && notifications.length === 0 && <p className="text-gray-600 text-center py-4">Loading notifications...</p>}
      {!isLoading && filteredAndSortedNotifications.length === 0 && !error && (
          <p className="text-gray-600 text-center py-4">
            {filter === 'unread' ? 'No unread notifications.' : 'No notifications to display.'}
          </p>
      )}

      {filteredAndSortedNotifications.length > 0 && (
        <ul className="space-y-4">
          {filteredAndSortedNotifications.map(notif => {
            const isItemDeleting = itemActionLoading[notif.id] === 'deleting';
            const isItemMarkingRead = itemActionLoading[notif.id] === 'markingRead';
            const isItemProcessing = isItemDeleting || isItemMarkingRead;

            return (
              <li key={notif.id}
                className={`bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition-shadow duration-200 
                           ${notif.is_read ? 'border-gray-200 opacity-80' : 'border-blue-400'}
                           ${isItemProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{notif.title}</h3>
                    {!notif.is_read && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full mb-2 inline-block">New</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notif.is_read && (
                       <button
                        onClick={() => handleMarkIndividualAsRead(notif.id)}
                        disabled={isItemProcessing || globalActionInProgress || notif.is_read}
                        className="p-1 text-green-500 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mark as Read"
                      >
                        {isItemMarkingRead ? <Loader2 size={18} className="animate-spin"/> : <Eye size={18} />}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        disabled={isItemProcessing || globalActionInProgress}
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Notification"
                      >
                        {isItemDeleting ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18} />}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 my-2 whitespace-pre-wrap">{notif.message}</p>
                <small className="text-xs text-gray-500 block">
                  Sent by: <span className="font-medium">{notif.sender_name} ({notif.sender_role})</span>
                </small>
                <small className="text-xs text-gray-500 block">
                  On: {new Date(notif.created_at).toLocaleString()}
                </small>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;