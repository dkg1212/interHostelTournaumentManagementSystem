// Sidebar.jsx
import { Link } from "react-router-dom";

const Sidebar = ({ role }) => {
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
      { to: "/dashboard/dsw", label: "Review Results" },
      { to: "/dashboard/dsw/approve", label: "Approve Entries" },
      { to: "/dashboard/dsw/reports", label: "Reports" },
    ],
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <nav className="flex flex-col gap-4">
        {links[role]?.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className="hover:bg-gray-700 px-4 py-2 rounded transition"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
