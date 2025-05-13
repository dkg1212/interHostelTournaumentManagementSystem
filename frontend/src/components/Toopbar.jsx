/* eslint-disable no-unused-vars */
// src/components/Topbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Bell,
  UserCircle2, // Lucide equivalent for FaUserCircle
  Sun,
  Moon,
  Award, // For the title icon
} from 'lucide-react';
import { motion } from 'framer-motion';

const Topbar = ({ toggleTheme, currentTheme, handleLogout: onLogout }) => { // Renamed handleLogout to onLogout to avoid conflict
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // Assuming 'user' stores user info

  // Use the onLogout prop if provided, otherwise fallback to local handler
  const performLogout = onLogout || (() => {
    localStorage.removeItem("user"); // Or your specific token/user key
    localStorage.removeItem("theme"); // Clear theme on logout
    navigate("/login");
  });

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md h-16 z-50 flex items-center justify-between px-4 sm:px-6">
      {/* Left - Title */}
      <div className="flex items-center">
        <Award className="h-7 w-7 text-indigo-600 dark:text-indigo-400 mr-2" />
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white tracking-tight">
          IHTMS {/* Short for Inter-Hostel Tournament Management System */}
        </h1>
      </div>

      {/* Right - Actions & User Info */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Theme Toggle Button - Only if toggleTheme and currentTheme are passed */}
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

        {/* Notification Icon (Example) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {/* Example notification badge */}
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
            3
          </span>
        </motion.button>

        {/* User Info Dropdown (Conceptual - can be expanded) */}
        <div className="flex items-center space-x-2 cursor-pointer group">
          <UserCircle2 size={28} className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          {user && (
            <div className="hidden sm:block text-sm">
              <p className="font-medium text-gray-700 dark:text-gray-200">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'Role'}</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
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
      </div>
    </header>
  );
};

export default Topbar;