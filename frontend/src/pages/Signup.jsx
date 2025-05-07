// src/pages/Signup.jsx
import { useState } from 'react';
import { signup } from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-2 border rounded" type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input className="w-full p-2 border rounded" type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="w-full p-2 border rounded" type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="role" onChange={handleChange} className="w-full p-2 border rounded" value={form.role}>
          <option value="student">Student</option>
          <option value="hostel_admin">Hostel Admin</option>
          <option value="dsw">DSW</option>
          <option value="tusc">TUSC</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Sign Up</button>
      </form>
    </div>
  );
}
