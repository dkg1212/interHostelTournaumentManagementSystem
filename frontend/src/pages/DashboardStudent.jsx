// DashboardStudent.jsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";

const DashboardStudent = () => {
  return (
    <div className="flex">
      <Sidebar role="student" />
      <div className="flex-1">
        <Topbar />
        <div className="p-4">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          {/* Display Upcoming Events, Registered Events, Results, etc. */}
        </div>
      </div>
    </div>
  );
};

export default DashboardStudent;
