import React from 'react';
import { Link } from 'react-router-dom';  // Import Link from React Router
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";

const DashboardHostelAdmin = () => {
  return (
    <div className="flex">
      <Sidebar role="hostel_admin" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Hostel Admin Dashboard</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Add/view hostel participants</li>
            <li>Assign participants to events</li>
            <li>Track performance</li>
            <li>Get notifications about TUSC/DSW actions</li>
          </ul>
          {/* Add a button that links to the Add Team page */}
          <div className="mt-6">
            <Link to="/add-team">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Go to Add Team Page
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHostelAdmin;
