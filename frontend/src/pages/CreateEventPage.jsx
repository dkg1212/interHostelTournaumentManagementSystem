import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";

const DashboardTUSC = () => {
  return (
    <div className="flex">
      <Sidebar role="tusc" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">TUSC Dashboard</h2>
          <ul className="space-y-4">
            <li>
              <Link
                to="/dashboard/events"
                className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
              >
                📅 Create and Edit Events
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/assign-coordinators"
                className="block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
              >
                👤 Assign Student Coordinators
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/review-result"
                className="block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded shadow"
              >
                🏆 View Match/Event Results
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/submit-to-dsw"
                className="block bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow"
              >
                ✅ Submit Entries to DSW for Approval
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardTUSC;
