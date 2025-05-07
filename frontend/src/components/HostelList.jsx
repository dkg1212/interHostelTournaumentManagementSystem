import React, { useEffect, useState } from 'react';
import { fetchHostels, deleteHostel } from '../services/hostelService';
import EditHostel from './EditHostel';

const HostelList = ({ refresh }) => {
  const [hostels, setHostels] = useState([]);
  const [editingHostel, setEditingHostel] = useState(null);

  useEffect(() => {
    fetchHostels()
      .then(res => setHostels(res.data.data))
      .catch(err => console.log(err));
  }, [refresh]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hostel?")) {
      try {
        await deleteHostel(id);
        setHostels(prev => prev.filter(h => h.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete hostel");
      }
    }
  };

  const handleEditClick = (hostel) => {
    setEditingHostel(hostel);
  };

  const handleUpdateDone = () => {
    setEditingHostel(null);
    fetchHostels().then(res => setHostels(res.data.data));
  };

  return (
    <div className="p-6 bg-gray-100 min-w-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">All Hostels</h2>

      {editingHostel && (
        <EditHostel hostel={editingHostel} onUpdate={handleUpdateDone} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {hostels.map(h => (
          <div
            key={h.id}
            className="w-72 h-auto bg-white rounded-2xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold text-gray-800">{h.name}</h3>
            <p className="text-sm text-gray-600 mt-2">Type: {h.gender}</p>
            <p className="text-sm text-gray-600">Warden: {h.warden_name}</p>
            <p className="text-xs text-gray-500 mt-2">Hostel ID: {h.id}</p>

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => handleEditClick(h)}
                className="text-sm bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(h.id)}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HostelList;
