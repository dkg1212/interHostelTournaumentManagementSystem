import React, { useState } from 'react';
import { updateHostel } from '../services/hostelService';

const EditHostel = ({ hostel, onUpdate }) => {
  const [form, setForm] = useState({
    name: hostel.name,
    gender: hostel.gender,
    warden_name: hostel.warden_name,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateHostel(hostel.id, form);
      alert("Hostel updated successfully!");
      onUpdate();
    } catch (err) {
      console.error(err);
      alert("Failed to update hostel");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto mb-6 border">
      <h2 className="text-lg font-bold mb-4 text-center">Edit Hostel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Hostel Name"
          required
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        >
          <option value="">Select Gender</option>
          <option value="Boys">Boys</option>
          <option value="Girls">Girls</option>
        </select>
        <input
          type="text"
          name="warden_name"
          value={form.warden_name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Warden Name"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Update Hostel
        </button>
      </form>
    </div>
  );
};

export default EditHostel;
