import React, { useState } from 'react';
import { login } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form);
      console.log('Login response:', res.data);

      if (res.data?.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative min-w-screen min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1608477337670-1f4e674f1a2b?auto=format&fit=crop&w=1470&q=80')",
        }}
      ></div>

      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <div className="relative z-10 bg-[#111] bg-opacity-90 p-10 rounded-md w-full max-w-md text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-red-600">Betflix</h1>
        <h2 className="text-xl font-semibold mb-4">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 transition p-3 rounded font-semibold"
          >
            Sign In
          </button>
        </form>
        <p className="text-sm text-gray-400 mt-6 text-center">
          New to Betflix?{' '}
          <Link to='/signup' className="text-white hover:underline cursor-pointer">
            Sign up now
            </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
