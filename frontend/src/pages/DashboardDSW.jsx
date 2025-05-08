// src/pages/DashboardDSW.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";
import { fetchEventStats, approveEntry, rejectEntry } from "../services/eventService";

const DashboardDSW = () => {
  const [eventStats, setEventStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEventStats = async () => {
      try {
        // fetchEventStats() returns { success, totalScores, data }
        const res = await fetchEventStats();
        // grab the array inside `data`
        setEventStats(res.data || []);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Error loading event stats");
      } finally {
        setLoading(false);
      }
    };
    loadEventStats();
  }, []);

  const handleApproval = (eventId, action) => {
    if (action === "approve") {
      approveEntry(eventId);
    } else {
      rejectEntry(eventId);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="dsw" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">DSW Dashboard</h2>

          {loading ? (
            <div>Loading event data...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Event Stats</h3>
                <table className="table-auto w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2">Event Name</th>
                      <th className="border p-2">Hostel</th>
                      <th className="border p-2">Result</th>
                      <th className="border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventStats.map((evt) => (
                      <tr key={evt.id}>
                        <td className="border p-2">{evt.event_name}</td>
                        <td className="border p-2">{evt.hostel_name}</td>
                        <td className="border p-2">{evt.score}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => handleApproval(evt.id, "approve")}
                            className="bg-green-500 text-white px-3 py-1 rounded-md"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(evt.id, "reject")}
                            className="bg-red-500 text-white px-3 py-1 rounded-md ml-2"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                    {eventStats.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          No event stats available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold">Export Reports</h3>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">
                  Export Event Results
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDSW;
