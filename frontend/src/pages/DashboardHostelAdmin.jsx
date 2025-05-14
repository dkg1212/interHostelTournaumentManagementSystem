import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar"; // Corrected typo from Toopbar to Topbar
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BellAlertIcon,
  PlusCircleIcon, // For Add Team
  XMarkIcon // For closing modal
} from '@heroicons/react/24/outline'; // Using outline icons

// A simple Modal component (can be in a separate file)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const DashboardHostelAdmin = () => {
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const features = [
    {
      id: 'participants',
      title: 'Manage Participants',
      description: 'Add, view, or edit hostel participants.',
      icon: <UserGroupIcon className="h-10 w-10 text-indigo-500 mb-3" />,
      action: () => setIsAddParticipantModalOpen(true), // Example action
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      borderColor: 'border-indigo-500'
    },
    {
      id: 'assign',
      title: 'Assign to Events',
      description: 'Assign participants to various events.',
      icon: <CalendarDaysIcon className="h-10 w-10 text-green-500 mb-3" />,
      action: () => setIsAssignModalOpen(true), // Example action
      bgColor: 'bg-green-50 hover:bg-green-100',
      borderColor: 'border-green-500'
    },
    {
      id: 'performance',
      title: 'Track Performance',
      description: 'Monitor team and individual performance metrics.',
      icon: <ChartBarIcon className="h-10 w-10 text-yellow-500 mb-3" />,
      action: () => alert('Navigating to Performance Tracking...'), // Placeholder
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'notifications',
      title: 'TUSC/DSW Notifications',
      description: 'Stay updated with actions and announcements.',
      icon: <BellAlertIcon className="h-10 w-10 text-red-500 mb-3" />,
      action: () => alert('Showing Notifications...'), // Placeholder
      bgColor: 'bg-red-50 hover:bg-red-100',
      borderColor: 'border-red-500'
    },
  ];

  // Assuming the Sidebar component is fixed-positioned and has a width 
  // equivalent to Tailwind's 'w-64' (16rem). 
  // This class will provide the necessary left margin to the main content area.
  // If your Sidebar has a different width (e.g., w-48, w-72), adjust this class accordingly (e.g., "ml-48", "ml-72").
  const sidebarOffsetClass = "ml-64";

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="hostel_admin" /> {/* Assumed to be fixed/absolute positioned with a defined width */}
      
      {/* Main content wrapper */}
      {/* Added `${sidebarOffsetClass}` to apply margin-left, preventing overlap with the sidebar */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOffsetClass}`}>
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Hostel Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 border-l-4 ${feature.bgColor} ${feature.borderColor}`}
                  onClick={feature.action}
                >
                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-gray-700 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Link to Add Team Page - styled as a card or a prominent button */}
            <div className="mt-8">
              <Link
                to="/add-team"
                className="flex items-center justify-center w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 text-lg font-medium"
              >
                <PlusCircleIcon className="h-6 w-6 mr-2" />
                Go to Add Team Page
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setIsAddParticipantModalOpen(false)}
        title="Add/View Hostel Participants"
      >
        <p className="mb-4">This is where the form or list for managing participants would go.</p>
        <form>
          <div className="mb-4">
            <label htmlFor="participantName" className="block text-sm font-medium text-gray-700">Participant Name</label>
            <input type="text" id="participantName" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Add Participant
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Participants to Events"
      >
        <p>Interface for assigning participants to events will be here.</p>
        {/* You could have dropdowns for participants and events */}
      </Modal>

    </div>
  );
};

export default DashboardHostelAdmin;