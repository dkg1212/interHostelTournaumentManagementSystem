/* eslint-disable no-unused-vars */
// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDays,     // Upcoming Events
  ListOrdered,      // My Events
  Award,            // Results
  Users,            // Participants, Assign Coordinators
  Edit3,            // Assign Events
  BarChart3,        // Performance, Reports
  Settings2,        // Manage Events
  ClipboardList,    // Submit Results, Review Results
  ThumbsUp,         // Approve Entries
  LayoutDashboard,  // Default icon / Dashboard Title
  ShieldCheck,      // Alternative for Dashboard Title
} from 'lucide-react'; // Using lucide-react icons
import { motion } from 'framer-motion';

const Sidebar = ({ role, onLinkClick }) => { // Added onLinkClick for potential mobile sidebar closing
  const location = useLocation();

  // Mapping labels to Lucide icons
  const iconMap = {
    "Upcoming Events": CalendarDays,
    "My Events": ListOrdered,
    "Results": Award,
    "Participants": Users,
    "Assign Events": Edit3,
    "Performance": BarChart3,
    "Manage Events": Settings2,
    "Assign Coordinators": Users, // Could use UserPlus or similar if more specific needed
    "Submit Results": ClipboardList,
    "Review Results": ClipboardList, // Consistent icon for result-related actions
    "Approve Entries": ThumbsUp,
    "Reports": BarChart3,
  };

  const links = {
    student: [
      { to: "/dashboard/student", label: "Upcoming Events" },
      { to: "/dashboard/student/registered", label: "My Events" },
      { to: "/dashboard/student/results", label: "Results" },
    ],
    hostel_admin: [
      { to: "/dashboard/hostel-admin", label: "Participants" },
      { to: "/dashboard/hostel-admin/assign", label: "Assign Events" },
      { to: "/dashboard/hostel-admin/performance", label: "Performance" },
    ],
    tusc: [
      { to: "/dashboard/tusc", label: "Manage Events" },
      { to: "/dashboard/tusc/coordinators", label: "Assign Coordinators" },
      { to: "/dashboard/tusc/submit-result", label: "Submit Results" },
    ],
    dsw: [
      { to: "/dashboard/dsw/review-results", label: "Review Results" },
      { to: "/dashboard/dsw/approve", label: "Approve Entries" },
      { to: "/dashboard/dsw/reports", label: "Reports" },
    ],
    // Example for a generic admin role if needed
    // admin: [
    //   { to: "/admin/dashboard", label: "Overview" },
    //   { to: "/admin/users", label: "Manage Users" },
    //   { to: "/admin/settings", label: "System Settings"},
    // ]
  };

  const currentLinks = links[role] || []; // Fallback to empty array if role is undefined

  return (
    // Sidebar styling consistent with DashboardTUSC.jsx's black sidebar
    <aside className="bg-gray-900 text-gray-300 w-64 h-screen flex-shrink-0 flex flex-col p-4 shadow-2xl fixed left-0 top-0 bottom-0 overflow-y-auto">
      {/* Sidebar Header */}
      <div className="mb-8 mt-2">
        <Link to={role ? `/dashboard/${role}` : "/"} className="flex items-center space-x-2.5 group">
          <ShieldCheck size={28} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <h2 className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors tracking-tight">
            {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Portal` : "Dashboard"}
          </h2>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow space-y-1.5">
        {currentLinks.map((link) => {
          const IconComponent = iconMap[link.label] || LayoutDashboard; // Fallback icon
          const isActive = location.pathname === link.to || (location.pathname.startsWith(link.to) && link.to !== `/dashboard/${role}`);


          return (
            <motion.div
              key={link.to}
              whileHover={{ x: 3, backgroundColor: "rgba(55, 65, 81, 0.7)" }} // bg-gray-700 with opacity
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link
                to={link.to}
                onClick={onLinkClick} // Call this if sidebar needs to close on mobile after click
                className={`flex items-center space-x-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-indigo-600 text-white shadow-md scale-100" // Active link style
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50" // Inactive link style
                  }`}
              >
                <IconComponent
                  size={18}
                  className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}
                />
                <span>{link.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Optional: Footer or additional links at the bottom */}
      <div className="mt-auto border-t border-gray-700/50 pt-4">
        {/* Example: Settings link common to all roles */}
        {/* <Link to="/settings" className="flex items-center space-x-3 py-2 px-3 rounded-md text-sm text-gray-400 hover:bg-gray-700 hover:text-white">
          <Settings2 size={18} />
          <span>Settings</span>
        </Link> */}
        <p className="text-xs text-gray-500 text-center">© {new Date().getFullYear()} IHTMS</p>
      </div>
    </aside>
  );
};

export default Sidebar;