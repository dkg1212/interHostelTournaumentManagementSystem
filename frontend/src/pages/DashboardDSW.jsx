import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";

const DashboardDSW = () => {
  return (
    <div className="flex">
      <Sidebar role="dsw" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">DSW Dashboard</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>View submitted results</li>
            <li>Approve/reject entries</li>
            <li>See final event stats</li>
            <li>Export/download reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardDSW;
