/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react'; // Added useState, useEffect, useCallback
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import {
  LogOut,
  Bell,
  UserCircle2,
  Sun,
  Moon,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Topbar = ({ toggleTheme, currentTheme, handleLogout: onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false); // Optional: for loading state

  const getToken = () => localStorage.getItem('token');

  // Function to fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    // Only fetch if user is logged in (token exists)
    if (!token) {
      setUnreadCount(0); // Ensure count is 0 if no token/user
      return;
    }

    // Don't show loading indicator for background polls, only for initial?
    // setIsLoadingCount(true);
    try {
      const response = await fetch('/api/notification/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } else {
        // console.error('Failed to fetch unread count:', response.statusText);
        // Potentially setUnreadCount(0) or handle error display
      }
    } catch (error) {
      // console.error('Error fetching unread count:', error);
    } finally {
      // setIsLoadingCount(false);
    }
  }, []); // No dependency on 'user' state directly, relies on token presence

  useEffect(() => {
    // Update user state if localStorage changes (e.g., after login/logout on another tab)
    const handleStorageChange = () => {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
        // If user logs out from another tab, token might be gone, refetch count will handle it.
        fetchUnreadCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Initial fetch
    fetchUnreadCount();

    // Set up polling: fetch count every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUnreadCount]);


  // Refetch count when navigating away from notification page,
  // as actions there might have changed the count.
  useEffect(() => {
    if (location.pathname !== '/notifications') {
        // This ensures that if we come from notifications page where count might have been reset
        // by an admin, the topbar reflects it sooner than next poll.
        // However, this might be too aggressive. Polling often suffices.
        // fetchUnreadCount(); // You can enable this if polling feels too slow after leaving notifications page
    }
  }, [location.pathname, fetchUnreadCount]);


  const performLogout = onLogout || (() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Make sure token is also cleared
    localStorage.removeItem("theme");
    setUser(null); // Update user state
    setUnreadCount(0); // Reset count on logout
    navigate("/login");
  });

  const handleNotificationClick = () => {
    navigate('/notifications');
    // Note: The actual marking as read happens on NotificationPage if an admin takes action.
    // The unreadCount here will update via polling or when user navigates away.
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md h-16 z-50 flex items-center justify-between px-4 sm:px-6">
      {/* Left - Title */}
      <div className="flex items-center">
        <Award className="h-7 w-7 text-indigo-600 dark:text-indigo-400 mr-2" />
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight">
          IHTMS
        </h1>
      </div>

      {/* Right - Actions & User Info */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {toggleTheme && currentTheme && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            aria-label="Toggle theme"
          >
            {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>
        )}

        {/* Notification Icon - Now dynamic */}
        {user && ( // Only show notification bell if user is logged in
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNotificationClick}
            className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
        )}

        {user && ( // Only show user info and logout if user is logged in
          <>
            <div className="flex items-center space-x-2 cursor-pointer group">
              <UserCircle2 size={28} className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              {user.name && ( // Check if user.name exists
                <div className="hidden sm:block text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'Role'}</p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={performLogout}
              className="flex items-center space-x-1.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition-colors"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </>
        )}
      </div>
    </header>
  );
};

export default Topbar;