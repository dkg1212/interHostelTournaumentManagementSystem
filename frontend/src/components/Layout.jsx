import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Participants', path: '/participants' },
  
    // Add more items here
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`bg-gray-800 text-white p-4 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex justify-between items-center mb-6">
          {!collapsed && <h2 className="text-2xl font-bold">Dashboard</h2>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-gray-700 p-1 rounded hover:bg-gray-600"
            title="Toggle Sidebar"
          >
            {collapsed ? '➡️' : '⬅️'}
          </button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block p-2 rounded ${
                location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-gray-700'
              } ${collapsed ? 'text-sm' : ''}`}
              title={collapsed ? item.label : ''}
            >
              {collapsed ? item.label[0] : item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
          >
            {collapsed ? '⎋' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {/* Header */}
        <header className="bg-white p-4 shadow mb-6 rounded flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Inter-Hostel Management System
          </h1>
          {/* Placeholder for user info */}
          <div className="text-sm text-gray-500">Logged in as Admin</div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
