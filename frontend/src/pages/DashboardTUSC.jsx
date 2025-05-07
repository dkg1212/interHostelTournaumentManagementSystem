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
          <ul className="list-disc pl-5 space-y-2">
            <li>Create and edit events</li>
            <li>Assign student coordinators</li>
            <li>View match/event results</li>
            <li>Submit entries to DSW for approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardTUSC;
