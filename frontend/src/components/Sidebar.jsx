// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  FiCalendar,
  FiList,
  FiCheckCircle,
  FiUsers,
  FiEdit,
  FiTrendingUp,
  FiSettings,
  FiClipboard,
  FiThumbsUp,
} from "react-icons/fi";

const Sidebar = ({ role }) => {
  const location = useLocation();

  const iconMap = {
    "Upcoming Events": <FiCalendar />,
    "My Events": <FiList />,
    "Results": <FiCheckCircle />,
    "Participants": <FiUsers />,
    "Assign Events": <FiEdit />,
    "Performance": <FiTrendingUp />,
    "Manage Events": <FiSettings />,
    "Assign Coordinators": <FiUsers />,
    "Submit Results": <FiClipboard />,
    "Review Results": <FiClipboard />,
    "Approve Entries": <FiThumbsUp />,
    "Reports": <FiTrendingUp />,
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
      { to: "/dashboard/tusc/submit", label: "Submit Results" },
    ],
    dsw: [
      { to: "/dashboard/dsw/review-results", label: "Review Results" },
      { to: "/dashboard/dsw/approve", label: "Approve Entries" },
      { to: "/dashboard/dsw/reports", label: "Reports" },
    ],
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-8 tracking-wide">🏠 Dashboard</h2>
      <nav className="flex flex-col gap-3">
        {links[role]?.map((link, index) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={index}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              {iconMap[link.label] || <FiList />}
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
