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
    setError('');
    try {
      await signup(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="relative min-h-screen min-w-screen flex items-center justify-center bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1590490350431-c55b67c3a214?auto=format&fit=crop&w=1470&q=80')",
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      {/* Signup Form */}
      <div className="relative z-10 w-full max-w-md p-8 bg-[#111] bg-opacity-90 rounded-lg shadow-xl text-white">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">Betflix</h1>
        <h2 className="text-xl font-semibold mb-4 text-center">Create an Account</h2>
        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full p-3 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#333] text-white focus:outline-none"
          >
            <option value="student">Student</option>
            <option value="hostel_admin">Hostel Admin</option>
            <option value="dsw">DSW</option>
            <option value="tusc">TUSC</option>
          </select>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 transition p-3 rounded font-semibold"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Already have an account?{' '}
          <span
            className="text-white hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
