import React, { useState } from 'react';
import { login } from '../services/auth';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

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
    <div className="flex items-center justify-center bg-gradient-to-r from-indigo-900 to-indigo-700 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="min-w-screen w-full max-w-5xl min-h-screen bg-indigo-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Right: Login Form (now on the left side) */}
        <div className="md:w-1/2 p-20 flex flex-col justify-center">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-4 "
          >
            Welcome Back 👋
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-500 mb-8"
          >
            Login to access your account
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-600">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-600">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md shadow-md transition"
            >
              Sign In
            </motion.button>
          </motion.form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
          </div>
        </div>

        {/* Left: Illustration (now on the right side) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="md:w-6/6 min-h-screen bg-indigo-100"
        >
          <img 
            src="/fingerprint-login.png" // Place this image in your public folder
            alt="Login Illustration"
            className="h-full object-cover p-6 "
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
