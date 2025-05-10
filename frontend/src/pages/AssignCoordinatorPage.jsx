/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Toopbar";

const AssignCoordinatorPage = () => {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [eventRes, studentRes] = await Promise.all([
        axios.get("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/users?role=student", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setEvents(eventRes.data);
      setStudents(studentRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedStudent) return;

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/events/${selectedEvent}/assign-coordinator`,
        { coordinator_id: selectedStudent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Coordinator assigned successfully!");
    } catch (err) {
      setMessage("Failed to assign coordinator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar role="tusc" />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Assign Student Coordinator</h2>

          {message && <p className="mb-4 text-blue-600">{message}</p>}

          <form onSubmit={handleAssign} className="space-y-4 max-w-md">
            <div>
              <label className="block font-medium mb-1">Select Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Select Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Select Student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loading ? "Assigning..." : "Assign Coordinator"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignCoordinatorPage;
