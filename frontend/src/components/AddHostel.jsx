// src/components/AddHostel.jsx

import React, { useState } from 'react';
import { createHostel } from '../services/hostelService';

const AddHostel = ({ onHostelAdded }) => {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    warden_name: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHostel(form);
      alert('Hostel created successfully!');
      setForm({ name: '', gender: '', warden_name: '' });
      if (onHostelAdded) onHostelAdded(); // refresh hostel list
    } catch (err) {
      console.error(err);
      alert('Error creating hostel');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto mb-8">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Hostel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Hostel Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
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
          placeholder="Warden Name"
          value={form.warden_name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Add Hostel
        </button>
      </form>
    </div>
  );
};

export default AddHostel;
