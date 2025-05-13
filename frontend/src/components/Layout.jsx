import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users, // Icon for Participants
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu, // For mobile toggle or a different style toggle
  ShieldCheck, // Example for Branding/Logo
  Sun, Moon // For potential theme toggle (optional)
} from 'lucide-react'; // Assuming you have lucide-react installed

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Participants', path: '/participants', icon: Users },
    // Add more items here with their respective icons
    // { label: 'Events', path: '/events', icon: CalendarDays },
    // { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      className={`flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-all duration-200
        ${location.pathname === item.path
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }
        ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? item.label : ''}
    >
      <item.icon size={collapsed ? 22 : 20} className="flex-shrink-0" />
      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out shadow-lg
          ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo and Toggle */}
        <div className={`flex items-center p-4 border-b border-gray-700 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-indigo-400 hover:text-indigo-300">
              <ShieldCheck size={28} />
              <span>IHTMS</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Logout Button at the bottom */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200
              bg-red-600 hover:bg-red-700 text-white
              ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? "Logout" : ""}
          >
            <LogOut size={collapsed ? 22 : 20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4 sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-700">
              {/* Dynamically set header based on current page or keep generic */}
              {navItems.find(item => item.path === location.pathname)?.label || 'Inter-Hostel Management'}
            </h1>
            <div className="flex items-center space-x-3">
              {/* Optional: Theme Toggle Example */}
              {/* <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
                <Sun size={20}/>
              </button> */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Admin</span>
                {/* You can add more user details here */}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;