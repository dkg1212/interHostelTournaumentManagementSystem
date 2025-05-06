import React, { useEffect, useState } from 'react';
import { fetchHostels } from '../services/hostelService';


const HostelList = () => {
  const [hostels, setHostels] = useState([]);

  useEffect(() => {
    fetchHostels()
      .then(res => setHostels(res.data.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">All Hostels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {hostels.map(h => (
          <div
            key={h.id}
            className="w-72 h-40 bg-white rounded-2xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold text-gray-800">{h.name}</h3>
            <p className="text-sm text-gray-600 mt-2">Type: {h.type}</p>
            <p className="text-xs text-gray-500 mt-4">Hostel ID: {h.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
}
export default HostelList;
