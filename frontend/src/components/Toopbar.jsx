// src/components/Topbar.jsx
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiBell } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 shadow-md p-4 flex justify-between items-center">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-800 tracking-wide">
        🏆 Inter-Hostel Management System
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="relative text-gray-600 hover:text-blue-600">
          <FiBell size={20} />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            1
          </span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <FaUserCircle size={24} className="text-blue-700" />
          <div className="text-sm text-gray-700 font-medium">
            {user?.name}{" "}
            <span className="text-xs text-gray-500">({user?.role})</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm hover:bg-red-600 transition"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
